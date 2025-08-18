// Jenkinsfile (Declarative Pipeline)

pipeline {
    agent any // 在任何可用的 Jenkins agent 上执行

    environment {
        // 定义一些变量，方便复用和修改
        // !! 修改为你自己的应用名称 !!
        APP_NAME = 'trantor'
        // !! 修改为你希望 Docker 镜像使用的名称 !!
        DOCKER_IMAGE_NAME = "univedge_amber/${APP_NAME}"
        // !! 修改为你希望 Docker 容器使用的名称 !!
        DOCKER_CONTAINER_NAME = "univedge_amber_${APP_NAME}"
        // !! 修改为你的应用容器需要暴露的端口，格式：主机端口:容器端口 !!
        // !! 确保主机端口没有被 OpenResty 或 Jenkins 占用 !!
        APP_PORT_MAPPING = '5888:80'
        DOCKER_BUILDKIT = '1'
        
        // API 凭证配置 (从 Jenkins Credentials 中获取)
        // !! 请在 Jenkins 中配置对应的 Credential ID !!
        LLM_API_KEY = credentials('trantor-llm-api-key')        // Secret text
        LLM_BASE_URL = credentials('trantor-llm-base-url')      // Secret text  
        LLM_MODEL_NAME = credentials('trantor-llm-model-name')  // Secret text
        // MyOS 系统密码
        MYOS_PASSWORD = credentials('trantor-myos-password') // Secret text
    }

    stages {
        stage('Checkout') {
            steps {
                // 从 Git 仓库拉取代码
                echo 'Checking out code...'
                // 如果是私有仓库，需要配置 Credentials
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']], // 或者你的分支名
                    userRemoteConfigs: [[
                        credentialsId: 'shenqingchuan-github-ssh-private-key', // !! 替换为你设置的 Jenkins 凭证 ID !!
                        url: 'git@github.com:ShenQingchuan/Trantor.git' // !! 替换为你的仓库 URL !!
                    ]]
                ])
            }
        }

        stage('Prepare Buildx') {
            steps {
                script {
                    sh '''
                        #!/bin/bash
                        set -e # Enable strict mode: exit immediately if a command exits with a non-zero status

                        echo "--- Preparing Buildx ---"

                        # Define installation variables
                        # !! IMPORTANT: Check the latest stable version on GitHub releases (https://github.com/docker/buildx/releases) !!
                        BUILDX_VERSION='v0.23.0'
                        # Target directory for the plugin (standard system-wide location)
                        BUILDX_DIR='/usr/local/lib/docker/cli-plugins'

                        # Check if buildx is already installed and working
                        # Test for the binary file AND verify it can be executed successfully
                        # Note: dollar signs $ are now interpreted by bash, not Groovy
                        if test -f "${BUILDX_DIR}/docker-buildx" && docker buildx version > /dev/null 2>&1; then
                            echo "docker-buildx already found and working at ${BUILDX_DIR}."
                        else
                            echo "docker-buildx not found or not working. Proceeding with installation."

                            # --- Install Dependencies (e.g., curl for downloading) ---
                            # Check if apt-get is available (simple way to detect Debian/Ubuntu-like)
                            if command -v apt-get >/dev/null; then
                                echo "Using apt-get to install curl..."
                                # apt-get update might fail on some ephemeral containers, added || true to proceed
                                apt-get update || echo "apt update failed, proceeding (curl might be pre-installed)."
                                # --no-install-recommends to avoid unnecessary packages
                                apt-get install -y --no-install-recommends curl || echo "curl installation failed (might be pre-installed or package missing)."
                            # Check if apk is available (for Alpine)
                            elif command -v apk >/dev/null; then
                                echo "Using apk to install curl..."
                                apk update || echo "apk update failed, proceeding (curl might be pre-installed)."
                                apk add --no-cache curl || echo "curl installation failed (might be pre-installed or package missing)."
                            else
                                echo "Neither apt-get nor apk found. Assuming curl is pre-installed or download will fail."
                            fi

                            # --- Download and Install Buildx Binary ---
                            echo "Downloading docker-buildx ${BUILDX_VERSION} binary..."
                            # Create the target directory (mkdir -p won't fail if it exists)
                            mkdir -p "${BUILDX_DIR}" || { echo "Error: Failed to create directory ${BUILDX_DIR}!"; exit 1; } # Exit if mkdir fails

                            # Determine architecture (assuming standard uname output)
                            ARCH=$(uname -m)
                            case "$ARCH" in
                                x86_64) ARCH="amd64" ;;
                                aarch64) ARCH="arm64" ;;
                                *) echo "Unsupported architecture: $ARCH. Cannot download buildx."; exit 1 ;; # Add more cases if needed
                            esac

                            # Download URL
                            BUILDX_URL="https://github.com/docker/buildx/releases/download/${BUILDX_VERSION}/buildx-${BUILDX_VERSION}.linux-${ARCH}"
                            echo "Downloading from: ${BUILDX_URL}"

                            # Use curl to download the binary
                            # Use ! command to check for curl success
                            if ! curl -sSL "${BUILDX_URL}" -o "${BUILDX_DIR}/docker-buildx"; then
                                echo "Error: Failed to download docker-buildx binary from ${BUILDX_URL}!"
                                exit 1 # Exit if download fails
                            fi

                            # Make the binary executable
                            chmod +x "${BUILDX_DIR}/docker-buildx" || { echo "Error: Failed to make docker-buildx executable!"; exit 1; } # Exit if chmod fails


                            # --- Verification ---
                            echo "Verifying installation..."
                            # Run docker buildx version again to confirm it works after installation
                            if docker buildx version; then # Run without redirect to show version on success
                                echo "docker-buildx installation successful."
                            else
                                echo "Error: docker buildx command failed after installation!"
                                exit 1 # Fail the step if verification fails
                            fi
                        fi # End of if block for installation

                        echo "--- Buildx preparation finished ---"

                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${env.DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    // 使用仓库根目录的 Dockerfile 构建镜像
                    // 使用 BUILD_NUMBER 作为 tag，方便追踪和回滚
                    // docker.build() 由 Docker Pipeline 插件提供
                    def customImage = docker.build("${env.DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}", '.')
                }
            }
        }

        stage('Deploy Docker Container') {
            steps {
                script {
                    echo "Deploying container: ${env.DOCKER_CONTAINER_NAME}"

                    // 检查同名容器是否存在，如果存在则停止并删除
                    // 使用 sh 步骤直接在 agent (也就是你的服务器) 上执行 shell 命令
                    // '|| true' 确保在容器不存在时命令不会失败导致流水线中断
                    sh "docker ps -q -f name=${env.DOCKER_CONTAINER_NAME} | xargs -r docker stop || true"
                    sh "docker ps -aq -f name=${env.DOCKER_CONTAINER_NAME} | xargs -r docker rm || true"

                    // 验证环境变量是否已设置 (不会泄露实际值)
                    echo "Verifying environment variables..."
                    sh """
                        if [ -z "${env.LLM_API_KEY}" ]; then
                            echo "ERROR: LLM_API_KEY is not set!"
                            exit 1
                        fi
                        if [ -z "${env.LLM_BASE_URL}" ]; then
                            echo "ERROR: LLM_BASE_URL is not set!"
                            exit 1
                        fi
                        echo "Environment variables verification passed."
                    """

                    // 运行新的容器
                    echo "Starting new container from image ${env.DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    sh """
                        docker run -d \
                        --name ${env.DOCKER_CONTAINER_NAME} \
                        -p ${env.APP_PORT_MAPPING} \
                        -e NODE_ENV=production \
                        -e LLM_API_KEY="${env.LLM_API_KEY}" \
                        -e LLM_BASE_URL="${env.LLM_BASE_URL}" \
                        -e LLM_MODEL_NAME="${env.LLM_MODEL_NAME}" \
                        -e OWNER_PASSWORD="${env.MYOS_PASSWORD}" \
                        --restart=unless-stopped \
                        --health-cmd="curl -f http://localhost:80/api/ping || exit 1" \
                        --health-interval=30s \
                        --health-timeout=10s \
                        --health-retries=3 \
                        --health-start-period=40s \
                        ${env.DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}
                    """
                    
                    // 等待容器启动并验证健康状态
                    echo "Waiting for container to be healthy..."
                    timeout(time: 2, unit: 'MINUTES') {
                        script {
                            def maxAttempts = 12 // 2分钟，每10秒检查一次
                            def attempt = 0
                            def isHealthy = false
                            
                            while (attempt < maxAttempts && !isHealthy) {
                                attempt++
                                sleep(10)
                                
                                def healthStatus = sh(
                                    script: "docker inspect --format='{{.State.Health.Status}}' ${env.DOCKER_CONTAINER_NAME} || echo 'no-health'",
                                    returnStdout: true
                                ).trim()
                                
                                echo "Health check attempt ${attempt}/${maxAttempts}: ${healthStatus}"
                                
                                if (healthStatus == 'healthy') {
                                    isHealthy = true
                                    echo "✅ Container is healthy!"
                                } else if (healthStatus == 'unhealthy') {
                                    error("❌ Container health check failed!")
                                }
                            }
                            
                            if (!isHealthy) {
                                // 输出容器日志以便调试
                                echo "Container logs for debugging:"
                                sh "docker logs ${env.DOCKER_CONTAINER_NAME} --tail 50"
                                error("❌ Container failed to become healthy within timeout!")
                            }
                        }
                    }
                    // 清理所有旧版本镜像，严格只保留当前成功构建的镜像
                    echo "Starting cleanup of all old Docker images..."
                    
                    script {
                        def currentTag = env.BUILD_NUMBER
                        
                        try {
                            // 获取所有该应用的镜像标签（排除当前构建的标签）
                            def oldImages = sh(
                                script: """
                                    docker images ${env.DOCKER_IMAGE_NAME} --format "{{.Tag}}" | \
                                    grep -E '^[0-9]+\$' | \
                                    grep -v "^${currentTag}\$"
                                """,
                                returnStdout: true
                            ).trim().split('\n').findAll { it.trim() }
                            
                            if (oldImages.size() > 0) {
                                echo "Current image tag: ${currentTag}"
                                echo "Found old images to delete: ${oldImages.join(', ')}"
                                
                                oldImages.each { tag ->
                                    def imageToDelete = "${env.DOCKER_IMAGE_NAME}:${tag}"
                                    echo "Deleting old image: ${imageToDelete}"
                                    sh "docker rmi ${imageToDelete} || echo 'Failed to delete ${imageToDelete}, might be in use'"
                                }
                                
                                echo "✅ Cleanup completed. Only current image ${env.DOCKER_IMAGE_NAME}:${currentTag} remains."
                            } else {
                                echo "No old images found for cleanup. Only current image ${env.DOCKER_IMAGE_NAME}:${currentTag} exists."
                            }
                        } catch (Exception e) {
                            echo "⚠️ Image cleanup failed: ${e.getMessage()}"
                            echo "Continuing deployment as image cleanup is not critical..."
                        }
                    }
                }
            }
        }

        stage('Post-Build Actions') {
            steps {
                // 可以在这里添加构建后的通知，如邮件、Slack 等
                echo 'Build and deployment finished.'
                // 清理 Jenkins 工作空间（可选）
                cleanWs()
            }
        }
    }

    post {
        // 流水线结束后执行的操作，无论成功失败
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Pipeline succeeded!'
            // 发送成功通知
        }
        failure {
            echo 'Pipeline failed!'
            // 发送失败通知
        }
    }
}