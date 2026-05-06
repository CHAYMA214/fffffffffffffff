pipeline {
    agent any

    environment {
        // SonarQube
        SONAR_PROJECT_KEY       = 'mern-app'

        // URL de l'app déployée (pour DAST)
        APP_STAGING_URL         = 'http://localhost:5000'

        // Credentials Jenkins (à créer dans Jenkins > Credentials)
        SONAR_TOKEN             = credentials('sonar-token')
        GITHUB_TOKEN            = credentials('github-token')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
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
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend deps') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────
        // STAGE 3 — SAST (Analyse statique)
        // ─────────────────────────────────────────
        stage('SAST') {
            parallel {

                stage('Dependency Check') {
                    steps {
                        sh '''
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
                            publishHTML(target: [
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'reports/dependency-check',
                                reportFiles: 'dependency-check-report.html',
                                reportName: 'OWASP Dependency Check'
                            ])
                        }
                    }
                }

                stage('SonarQube Analysis') {
                    steps {
                        withSonarQubeEnv('SonarQube') {
                            sh """
                                docker run --rm \
                                    -e SONAR_HOST_URL=\${SONAR_HOST_URL} \
                                    -e SONAR_TOKEN=${SONAR_TOKEN} \
                                    -v \$(pwd):/usr/src \
                                    sonarsource/sonar-scanner-cli \
                                    -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                    -Dsonar.sources=. \
                                    -Dsonar.exclusions=**/node_modules/**,**/coverage/**
                            """
                        }
                        timeout(time: 5, unit: 'MINUTES') {
                            waitForQualityGate abortPipeline: true
                        }
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
                                --plugin security \
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
        // STAGE 4 — Build Docker images
        // ─────────────────────────────────────────
        stage('Build Docker Images') {
            steps {
                sh '''
                    docker-compose build --no-cache
                '''
            }
        }

        // ─────────────────────────────────────────
        // STAGE 5 — Scan images Docker (Trivy)
        // ─────────────────────────────────────────
        stage('Container Image Scan') {
            steps {
                sh '''
                    mkdir -p reports/trivy

                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v $(pwd)/reports/trivy:/reports \
                        aquasec/trivy:latest image \
                        --exit-code 1 \
                        --severity HIGH,CRITICAL \
                        --format template \
                        --template "@contrib/html.tpl" \
                        --output /reports/trivy-backend.html \
                        mern-backend:latest

                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v $(pwd)/reports/trivy:/reports \
                        aquasec/trivy:latest image \
                        --exit-code 1 \
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
                        reportName: 'Trivy Image Scan'
                    ])
                }
            }
        }

        // ─────────────────────────────────────────
        // STAGE 6 — Start staging containers (DAST)
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
        // STAGE 7 — DAST (Analyse dynamique)
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
                                zap-api-scan.py \
                                -t ${APP_STAGING_URL}/api-docs \
                                -f openapi \
                                -r zap-api-report.html \
                                -J zap-api-report.json \
                                -I \
                                -l WARN

                            docker run --rm \
                                --network host \
                                -v $(pwd)/reports/zap:/zap/wrk:rw \
                                ghcr.io/zaproxy/zaproxy:stable \
                                zap-baseline.py \
                                -t ${APP_STAGING_URL} \
                                -r zap-baseline-report.html \
                                -J zap-baseline-report.json \
                                -I
                        '''
                    }
                    post {
                        always {
                            publishHTML(target: [
                                reportDir: 'reports/zap',
                                reportFiles: 'zap-api-report.html',
                                reportName: 'ZAP API Scan'
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
                                sullo/nikto \
                                -h ${APP_STAGING_URL} \
                                -Format htm \
                                -output /tmp/nikto-report.html
                            docker cp $(docker ps -lq):/tmp/nikto-report.html \
                                reports/nikto/nikto-report.html || true
                        '''
                    }
                }
            }
        }

        // ─────────────────────────────────────────
        // STAGE 8 — Quality Gate global
        // ─────────────────────────────────────────
        stage('Quality Gate') {
            steps {
                script {
                    def zapReport = readJSON file: 'reports/zap/zap-api-report.json'
                    def highAlerts = zapReport.site?.collect { site ->
                        site.alerts?.findAll { it.riskdesc?.startsWith('High') || it.riskdesc?.startsWith('Critical') }
                    }?.flatten()

                    if (highAlerts && highAlerts.size() > 0) {
                        error "🚨 QUALITY GATE FAILED: ${highAlerts.size()} vulnérabilité(s) HIGH/CRITICAL détectée(s) par ZAP !"
                    }
                    echo "✅ Quality Gate passé — aucune vulnérabilité critique détectée"
                }
            }
        }
    }

    // ─────────────────────────────────────────
    // POST — Notifications & Cleanup
    // ─────────────────────────────────────────
    post {
        always {
            sh 'docker-compose down --remove-orphans || true'
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
        }

        success {
            echo "✅ Pipeline terminé avec succès"
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
                to: 'votre-email@domaine.com'
            )
        }
    }
}