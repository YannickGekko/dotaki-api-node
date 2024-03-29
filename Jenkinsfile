podTemplate(containers: [
  containerTemplate(name: 'docker', image: 'docker:1.11', command: 'cat', ttyEnabled: true),
  containerTemplate(name: 'node', image: 'node:8-alpine', command: 'cat', ttyEnabled: true),
  containerTemplate(name: 'aws', image: 'xueshanf/awscli:3.10-alpine', command: 'cat', ttyEnabled: true),
  containerTemplate(name: 'yq', image: 'mikefarah/yq:2.4.0', command: 'cat', ttyEnabled: true)
],
volumes: [
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]){
    node(POD_LABEL){
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'AWS_Dotaki_Preprod_Cred']]){
          stage('Build Image'){
              sh '''
              git clone https://github.com/loick-gekko/dotaki-api-node.git
              cd dotaki-api-node
              GIT_COMMIT="$(git rev-parse HEAD)"
              echo '###### Git START ########'
              echo $GIT_COMMIT
              echo '###### Git END ########'

              IMAGE=133845867148.dkr.ecr.eu-west-1.amazonaws.com/api-node-gekko-jenkins:$GIT_COMMIT
              echo 'export IMAGE=133845867148.dkr.ecr.eu-west-1.amazonaws.com/api-node-gekko-jenkins:'$GIT_COMMIT > ./load_env.sh
              echo 'export IMAGELATEST=133845867148.dkr.ecr.eu-west-1.amazonaws.com/api-node-gekko-jenkins:latest' >> ./load_env.sh
              echo 'export GIT_COMMIT='$GIT_COMMIT >> ./load_env.sh
              echo 'export REPO=133845867148.dkr.ecr.eu-west-1.amazonaws.com/api-node-gekko-jenkins' >> ./load_env.sh

              chmod 750 ./load_env.sh
              '''
              container('node'){
                  sh '''
                  echo '###### NPM START ########' 
                  cd dotaki-api-node  
                  rm -rf node_modules package-lock.json
                  npm install 
                  npm install kafka-node --save 
                  npm install body-parser --save 
                  npm install express --save
                  echo '###### NPM END ########'
                  ''' 
              } 
          }
          stage('Push Image In ECR'){
              container('aws'){
                  sh '''
                  cd dotaki-api-node
                  aws ecr get-login --no-include-email --region eu-west-1 > DOCKER_LOG
                  '''
              }
              container('docker'){
                  sh '''
                  cd dotaki-api-node
                  . ./load_env.sh
                  $(cat DOCKER_LOG)
				  pwd
				  ls -al
                  docker build -t $IMAGE .
                  docker tag $IMAGE $IMAGELATEST
                  docker push $IMAGE
                  docker push $IMAGELATEST
                  '''
              }
            }
            stage('commit for deploy'){
                withCredentials([usernamePassword(credentialsId: 'gitCredLoick', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh '''
                        git config --global user.name $USERNAME
                        git config --global user.email "jenkins@gekko.fr"

                        mkdir publish
                        cd publish 
                        git clone http://$USERNAME:$PASSWORD@github.com/loick-gekko/release-dota.git
                        cd release-dota
                        git checkout node-workers
                    '''
                    container('yq'){
                        sh '''
                            cd dotaki-api-node           
                            . ./load_env.sh
                            cd ..
                            pwd
                            cd publish/release-dota
                            yq w -i values.yaml image.repository $REPO
                            yq w -i values.yaml image.tag $GIT_COMMIT
                            mv values.yaml ../values.yaml
                        '''
                    }
                    sh '''
                        pwd
                        git config -l
                        cd publish/release-dota
                        
                        git pull
                        rm -f values.yaml && mv ../values.yaml .
                        git add values.yaml
                        git commit -m " Jenkins Job $JOB_NAME , Build number :  $BUILD_NUMBER"
                        git push --set-upstream origin node-workers
                    '''

                }
            }

            stage('Generate Report'){
                  sh '''
                  cd dotaki-api-node           
                  . ./load_env.sh
                  cd ..
                  mkdir report
                  cd report
                  echo '##############################################' > ./report.yaml
                  echo 'RapportDeBuild:' >> ./report.yaml
                  echo 'gitCommit: '$GIT_COMMIT >> ./report.yaml
                  echo 'imagesBuild : ' >> ./report.yaml
                  echo '  tagCommit : '$IMAGE >> ./report.yaml
                  echo '  tagLatest : '$IMAGELATEST >> ./report.yaml
                  echo '##############################################' >> ./report.yaml
                  cat ./report.yaml
                  '''
          }
        }
    }
}
