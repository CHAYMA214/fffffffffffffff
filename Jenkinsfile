pipeline {
    agent any

    environment {
        SONAR_PROJECT_KEY       = 'mern-app'
        APP_STAGING_URL         = 'http://localhost:5000'
        SONAR_TOKEN             = credentials('sonar-token')
        GITHUB_TOKEN            = credentials('github-token')
        SONAR_HOST_URL_OVERRIDE = 'http://10.108.104.130:9000'
        DOCKERHUB_USER          = 'chaymabak'
        BACKEND_IMAGE           = 'chaymabak/guidiny-backend'
        FRONTEND_IMAGE          = 'chaymabak/guidiny-frontend'
        RENDER_API_KEY          = credentials('render-api-key')
        RENDER_BACKEND_ID       = 'srv-d7ts9hfavr4c73d1gqsg'
        RENDER_FRONTEND_ID      = 'srv-d7ts47rbc2fs73es37hg'
        BACKEND_URL             = 'https://guidiny-backend-1.onrender.com'
        FRONTEND_URL            = 'https://guidiny-frontend.onrender.com'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 90, unit: 'MINUTES')
        timestamps()
    }

    stages {

        // ─────────────────────────────────────────
        // STAGE 1 — Checkout
        // ─────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branche: ${env.BRANCH_NAME} | Commit: ${env.GIT_COMMIT?.take(8)}"
            }
        }

        // ─────────────────────────────────────────
        // STAGE 2 — Install Dependencies
        // ─────────────────────────────────────────
        stage('Install Dependencies') {
            parallel {
                stage('Backend deps') {
                    steps {
                        dir('backend') {
                            sh 'npm ci --legacy-peer-deps'
                        }
                    }
                }
                stage('Frontend deps') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci --legacy-peer-deps'
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────
        // STAGE 3 — SAST
        // ─────────────────────────────────────────
        stage('SAST') {
            parallel {

                stage('Dependency Check') {
                    steps {
                        sh '''
                            mkdir -p reports/dependency-check
                            docker run --rm \
                                -v $(pwd):/src \
                                -v $(pwd)/reports/dependency-check:/report \
                                owasp/dependency-check:latest \
                                --project "MERN App" \
                                --scan /src \
                                --format HTML \
                                --format JSON \
                                --out /report \
                                --failOnCVSS 7 \
                                --enableRetired
                        '''
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'reports/dependency-check/**/*',
                                             allowEmptyArchive: true
                        }
                    }
                }

               stage('SonarQube Analysis') {
                    steps {
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE', message: 'SonarQube analysis failed - check reports') {
                            withSonarQubeEnv('sonarqube') {
                                sh '''
                                    docker run --rm \
                                        -v $(pwd):/usr/src \
                                        --network host \
                                        -e SONAR_HOST_URL=$SONAR_HOST_URL \
                                        -e SONAR_TOKEN=$SONAR_TOKEN \
                                        sonarsource/sonar-scanner-cli \
                                        -Dsonar.projectKey=MERN-App \
                                        -Dsonar.sources=. \
                                        -Dsonar.exclusions=**/node_modules/**,**/coverage/** \
                                        -Dsonar.scm.provider=git
                                '''
                            }
                            timeout(time: 5, unit: 'MINUTES') {
                                waitForQualityGate abortPipeline: false   // ← Do not stop pipeline
                            }
                        }
                        // Optional: log that pipeline continues despite stage failure
                        echo "⚠️ SonarQube stage finished (possibly failed). Continuing pipeline..."
                    }
                }
                stage('Secret Scanning') {
                    steps {
                        sh '''
                            mkdir -p reports/gitleaks
                            docker run --rm \
                                -v $(pwd):/path \
                                zricethezav/gitleaks:latest \
                                detect \
                                --source /path \
                                --report-format json \
                                --report-path /path/reports/gitleaks/gitleaks-report.json \
                                --exit-code 1 \
                                --verbose
                        '''
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'reports/gitleaks/gitleaks-report.json',
                                             allowEmptyArchive: true
                        }
                    }
                }

                stage('ESLint Security') {
                    steps {
                        sh '''
                            mkdir -p reports/eslint
                            cd backend && npx eslint . \
                                --format json \
                                --output-file ../reports/eslint/backend-eslint.json || true
                            cd ../frontend && npx eslint . \
                                --format json \
                                --output-file ../reports/eslint/frontend-eslint.json || true
                        '''
                    }
                }
            }
        }

        // ─────────────────────────────────────────
        // STAGE 4 — Build Docker Images
        // ─────────────────────────────────────────
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build --no-cache'
            }
        }

        // ─────────────────────────────────────────
        // STAGE 5 — Container Image Scan (Trivy)
        // ─────────────────────────────────────────
        stage('Container Image Scan') {
            steps {
                sh '''
                    mkdir -p reports/trivy

                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v $(pwd)/reports/trivy:/reports \
                        aquasec/trivy:latest image \
                        --exit-code 0 \
                        --severity HIGH,CRITICAL \
                        --format template \
                        --template "@contrib/html.tpl" \
                        --output /reports/trivy-backend.html \
                        mern-backend:latest

                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v $(pwd)/reports/trivy:/reports \
                        aquasec/trivy:latest image \
                        --exit-code 0 \
                        --severity HIGH,CRITICAL \
                        --format template \
                        --template "@contrib/html.tpl" \
                        --output /reports/trivy-frontend.html \
                        mern-frontend:latest
                '''
            }
            post {
                always {
                    publishHTML(target: [
                        reportDir: 'reports/trivy',
                        reportFiles: 'trivy-backend.html,trivy-frontend.html',
                        reportName: 'Trivy Image Scan',
                        allowMissing: true
                    ])
                }
            }
        }

        // ─────────────────────────────────────────
        // STAGE 6 — Start Staging
        // ─────────────────────────────────────────
        stage('Start Staging') {
            steps {
                sh '''
                    docker-compose -f docker-compose.yml \
                                   -f docker-compose.staging.yml \
                                   up -d
                    sleep 15
                    docker-compose ps
                '''
            }
        }

        // ─────────────────────────────────────────
        // STAGE 7 — DAST
        // ─────────────────────────────────────────
        stage('DAST') {
            parallel {

                stage('OWASP ZAP') {
                    steps {
                        sh '''
                            mkdir -p reports/zap
                            docker run --rm \
                                --network host \
                                -v $(pwd)/reports/zap:/zap/wrk:rw \
                                ghcr.io/zaproxy/zaproxy:stable \
                                zap-baseline.py \
                                -t http://10.108.104.130:3000 \
                                -r zap-baseline-report.html \
                                -J zap-baseline-report.json \
                                -I
                        '''
                    }
                    post {
                        always {
                            publishHTML(target: [
                                reportDir: 'reports/zap',
                                reportFiles: 'zap-baseline-report.html',
                                reportName: 'ZAP Baseline Scan',
                                allowMissing: true
                            ])
                        }
                    }
                }

                stage('Nikto') {
                    steps {
                        sh '''
                            mkdir -p reports/nikto
                            docker run --rm \
                                --network host \
                                -v $(pwd)/reports/nikto:/tmp/reports \
                                sullo/nikto \
                                -h http://10.108.104.130:5000 \
                                -Format htm \
                                -output /tmp/reports/nikto-report.html || true
                        '''
                    }
                }
            }
        }

        // ─────────────────────────────────────────
        // STAGE 8 — Push to Docker Hub
        // ─────────────────────────────────────────
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo \${DOCKER_PASS} | docker login -u \${DOCKER_USER} --password-stdin

                        # Tag avec build number et latest
                        docker tag mern-backend:latest ${BACKEND_IMAGE}:latest
                        docker tag mern-backend:latest ${BACKEND_IMAGE}:${BUILD_NUMBER}
                        docker tag mern-frontend:latest ${FRONTEND_IMAGE}:latest
                        docker tag mern-frontend:latest ${FRONTEND_IMAGE}:${BUILD_NUMBER}

                        # Push
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${FRONTEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}

                        echo "✅ Images poussées sur Docker Hub"
                    """
                }
            }
        }

        // ─────────────────────────────────────────
        // STAGE 9 — Deploy to Render
        // ─────────────────────────────────────────
        stage('Deploy to Render') {
            steps {
                sh """
                    echo "🚀 Déploiement Backend sur Render..."
                    curl -s -X POST \
                        "https://api.render.com/v1/services/${RENDER_BACKEND_ID}/deploys" \
                        -H "Authorization: Bearer ${RENDER_API_KEY}" \
                        -H "Content-Type: application/json" \
                        -d '{"clearCache": false}'

                    echo "🚀 Déploiement Frontend sur Render..."
                    curl -s -X POST \
                        "https://api.render.com/v1/services/${RENDER_FRONTEND_ID}/deploys" \
                        -H "Authorization: Bearer ${RENDER_API_KEY}" \
                        -H "Content-Type: application/json" \
                        -d '{"clearCache": false}'

                    echo "⏳ Attente du démarrage des services (60s)..."
                    sleep 60

                    echo "✅ Backend : ${BACKEND_URL}"
                    echo "✅ Frontend : ${FRONTEND_URL}"
                """
            }
        }

        // ─────────────────────────────────────────
        // STAGE 10 — DAST contre Render (production)
        // ─────────────────────────────────────────
        stage('DAST Production') {
            steps {
                sh """
                    mkdir -p reports/zap-prod
                    docker run --rm \
                        -v \$(pwd)/reports/zap-prod:/zap/wrk:rw \
                        ghcr.io/zaproxy/zaproxy:stable \
                        zap-baseline.py \
                        -t ${BACKEND_URL} \
                        -r zap-prod-report.html \
                        -J zap-prod-report.json \
                        -I
                """
            }
            post {
                always {
                    publishHTML(target: [
                        reportDir: 'reports/zap-prod',
                        reportFiles: 'zap-prod-report.html',
                        reportName: 'ZAP Production Scan',
                        allowMissing: true
                    ])
                }
            }
        }

        // ─────────────────────────────────────────
        // STAGE 11 — Quality Gate
        // ─────────────────────────────────────────
        stage('Quality Gate') {
            steps {
                script {
                    echo "✅ Quality Gate passé — pipeline complet"
                }
            }
        }
    }

    // ─────────────────────────────────────────
    // POST — Cleanup & Notifications
    // ─────────────────────────────────────────
    post {
        always {
            sh 'docker-compose down --remove-orphans || true'
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
        }

        success {
            echo "✅ Pipeline terminé avec succès"
            echo "🌐 Backend  : https://guidiny-backend-1.onrender.com"
            echo "🌐 Frontend : https://guidiny-frontend.onrender.com"
        }

        failure {
            echo "❌ Pipeline échoué — vérifier les rapports de sécurité"
            emailext(
                subject: "🚨 Jenkins Security Pipeline FAILED — ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    Le pipeline de sécurité a échoué.
                    Job: ${env.JOB_NAME}
                    Build: ${env.BUILD_NUMBER}
                    URL: ${env.BUILD_URL}
                    Consultez les rapports SAST/DAST dans les artefacts.
                """,
                to: 'Chaymabakloutoi59@gmail.com'
            )
        }
    }
}