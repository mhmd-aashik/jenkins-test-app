pipeline {
    // Run this pipeline on any available executor/agent
    agent any

    // Define environment variables used throughout the build pipeline stages
    environment {
        // Fallback port for tests and app start
        PORT = '3000'
        // Test database URL pointing to the temporary postgres container spun up during E2E testing
        DATABASE_URL = 'postgresql://postgres:postgrespassword@localhost:5435/tasks_test_db'
        // Docker image tag tag name
        DOCKER_IMAGE = 'nestjs-jenkins-app'
    }

    stages {
        // Stage 1: Check out code from Git Repository
        stage('Checkout') {
            steps {
                echo 'Checking out source code from Git repository...'
                checkout scm
            }
        }

        // Stage 2: Install dependencies cleanly using lockfile (npm ci)
        stage('Install Dependencies') {
            steps {
                echo 'Installing node package dependencies...'
                sh 'npm ci'
            }
        }

        // Stage 3: Run ESLint and Prettier checks
        stage('Lint & Format') {
            steps {
                echo 'Running code linter and formatting checks...'
                sh 'npm run lint'
            }
        }

        // Stage 4: Run unit tests using Jest
        stage('Unit Tests') {
            steps {
                echo 'Executing unit tests...'
                sh 'npm run test'
            }
        }

        // Stage 5: Spin up Postgres container, run Drizzle migrations, and execute E2E tests
        stage('Integration & E2E Tests') {
            steps {
                echo 'Setting up Docker Compose environment for E2E tests...'
                // Spin up test database container in detached (-d) background mode
                sh 'docker-compose -f docker-compose.test.yml up -d'
                
                echo 'Waiting for test database to become healthy...'
                // Wait for the postgres database container healthcheck to complete
                sh '''
                    for i in {1..10}; do
                        if [ "$(docker inspect --format \'{{.State.Health.Status}}\' nest_postgres_test)" = "healthy" ]; then
                            echo "Database is ready!"
                            break
                        fi
                        echo "Database not ready yet, waiting 3s..."
                        sleep 3
                    done
                '''

                echo 'Running Drizzle database migrations on test database...'
                sh 'npm run db:migrate'

                echo 'Executing E2E endpoint integration tests...'
                sh 'npm run test:e2e'
            }
            // Always clean up docker resources regardless of test success or failure
            post {
                always {
                    echo 'Cleaning up Docker test database...'
                    sh 'docker-compose -f docker-compose.test.yml down -v'
                }
            }
        }

        // Stage 6: Build the production-ready Docker image
        stage('Docker Build') {
            steps {
                echo "Building production Docker image: ${DOCKER_IMAGE}:${BUILD_NUMBER}..."
                sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
                sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest"
            }
        }

        // Stage 7: Simulated Deployment stage
        stage('Deploy') {
            steps {
                echo "Deploying NestJS application version ${BUILD_NUMBER}..."
                // In a production environment, this would involve pushing the image to a container registry
                // (e.g., Docker Hub, AWS ECR) and rolling out update on Kubernetes/ECS/Virtual Machine.
                // Example: sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                sh "echo 'Deployment completed successfully!'"
            }
        }
    }

    // Post-execution blocks for notifying build results (e.g., Slack integration)
    post {
        success {
            echo 'Build and Deployment succeeded!'
            // Sends a success message to Slack using Jenkins Slack Plugin
            slackSend (
                channel: '#ci-cd-alerts',
                color: 'good',
                message: "SUCCESS: Job '${env.JOB_NAME}' [build #${env.BUILD_NUMBER}] successfully built and deployed! (${env.BUILD_URL})"
            )
        }
        failure {
            echo 'Build failed! Please inspect logs.'
            // Sends a failure message to Slack using Jenkins Slack Plugin
            slackSend (
                channel: '#ci-cd-alerts',
                color: 'danger',
                message: "FAILURE: Job '${env.JOB_NAME}' [build #${env.BUILD_NUMBER}] failed. Please check build logs: ${env.BUILD_URL}"
            )
        }
    }
}
