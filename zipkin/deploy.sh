  echo '>>Use Docker daemon inside the Minikube instance'
  eval $(minikube docker-env)

  echo '>>Delete resources if exist'
  kubectl delete -f .

  echo '>>Create resources'
  kubectl apply -f .

  echo '>>Show resources'
  kubectl get pods
  kubectl get svc
