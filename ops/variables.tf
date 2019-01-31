variable "az_count" {
  description = "Number of AZs to cover in a given AWS region"
  default     = "2"
}

variable "app_image" {
  description = "Docker image to run in the ECS cluster"
  default     = "251487374146.dkr.ecr.us-east-2.amazonaws.com/prism-srv-staging:latest"
}

variable "app_port" {
  description = "Port exposed by the docker image to redirect traffic to"
  default     = 3000
}

variable "app_count" {
  description = "Number of docker containers to run"
  default     = 2
}

variable "mongo_url" {
    description = "The url of MongoDB"
    default = "mongodb://prism-srv:D1hjjtOG0CNCT075@cluster0-shard-00-00-magts.mongodb.net:27017,cluster0-shard-00-01-magts.mongodb.net:27017,cluster0-shard-00-02-magts.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  default     = "256"
}

variable "fargate_memory" {
  description = "Fargate instance memory to provision (in MiB)"
  default     = "512"
}