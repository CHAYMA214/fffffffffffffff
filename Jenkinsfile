pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/CHAYMA214/Guidiny.git',
                    branch: 'chayma'
            }
        }

        stage('Setup env') {
            steps {
                withCredentials([
                    string(credentialsId: 'MONGO_USERNAME', variable: 'MONGO_USERNAME'),
                    string(credentialsId: 'MONGO_PASSWORD', variable: 'MONGO_PASSWORD'),
                    string(credentialsId: 'MONGO_DB', variable: 'MONGO_DB'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'NODE_ENV', variable: 'NODE_ENV'),
                    string(credentialsId: 'GOOGLE_CLIENT_ID', variable: 'GOOGLE_CLIENT_ID'),
                    string(credentialsId: 'MONGO_URL', variable: 'MONGO_URL')
                ]) {
                    sh '''
                        echo "NODE_ENV=${NODE_ENV}" > .env
                        echo "MONGO_URL=${MONGO_URL}" >> .env
                        echo "MONGO_USERNAME=${MONGO_USERNAME}" >> .env
                        echo "MONGO_PASSWORD=${MONGO_PASSWORD}" >> .env
                        echo "MONGO_DB=${MONGO_DB}" >> .env
                        echo "JWT_SECRET=${JWT_SECRET}" >> .env
                        echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" >> .env
                        cp .env backend/.env
                        cp .env frontend/.env
                    '''
                }
            }
        }

        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down --remove-orphans || true'
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        success { echo 'Deployed successfully!' }
        failure { echo 'Pipeline failed!' }
    }
}