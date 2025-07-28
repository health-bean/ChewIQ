# VPC & Infrastructure Setup

This document covers the VPC configuration, private database setup, and bastion host access for the Health Platform.

## 🏗️ Architecture Overview

The Health Platform uses a **private VPC architecture** for enhanced security:

```
Internet Gateway
    ↓
Public Subnet (Bastion Host)
    ↓ [SSH Tunnel]
Private Subnet (RDS Database)
    ↓
Lambda Functions (VPC-enabled)
```

## 🔒 Security Architecture

### **Private Database**
- **RDS PostgreSQL** in private subnets
- **No public internet access**
- **VPC-only connectivity**

### **Bastion Host Access**
- **EC2 t3.micro** in public subnet
- **SSH key-based authentication**
- **Security group restrictions**

### **Lambda VPC Integration**
- **Lambda functions** deployed within VPC
- **Direct access** to private RDS
- **NAT Gateway** for external API calls

## 🚀 Bastion Host Configuration

### **Instance Details**
- **Instance Type**: t3.micro (free tier eligible)
- **AMI**: Amazon Linux 2
- **Key Pair**: `health-platform-bastion-key`
- **Public IP**: Dynamic (check AWS console)

### **Security Group Rules**
```
Inbound:
- SSH (22) from your IP address only
- ICMP from VPC CIDR (for health checks)

Outbound:
- All traffic (0.0.0.0/0) - for system updates
```

## 🔑 SSH Tunnel Setup

### **Connect to Bastion Host**
```bash
# Get current bastion IP from AWS console
BASTION_IP="52.90.82.1"  # Example - check current IP

# Connect to bastion
ssh -i health-platform-bastion-key.pem ec2-user@$BASTION_IP
```

### **Create SSH Tunnel to RDS**
```bash
# Create tunnel (local port 5434 → RDS port 5432)
ssh -i health-platform-bastion-key.pem \
    -L 5434:health-platform-dev-db.c5njva4wrrhe.us-east-1.rds.amazonaws.com:5432 \
    ec2-user@$BASTION_IP -N -f
```

### **Connect Through Tunnel**
```bash
# Connect to RDS through tunnel
PGPASSWORD="MH67HxZFAAmVWzc6zldv0ZL6" \
psql -h 127.0.0.1 -p 5434 -U healthadmin -d health_platform_dev
```

## 🗄️ Database Configuration

### **RDS Instance Details**
- **Engine**: PostgreSQL 14+
- **Instance Class**: db.t3.micro (free tier)
- **Storage**: 20 GB GP2 (free tier)
- **Multi-AZ**: Disabled (cost optimization)
- **Public Access**: **Disabled** (private only)

### **Connection Details**
```
Endpoint: health-platform-dev-db.c5njva4wrrhe.us-east-1.rds.amazonaws.com
Port: 5432
Database: health_platform_dev
Username: healthadmin
Password: [Stored in environment variables]
```

### **Security Group Rules**
```
Inbound:
- PostgreSQL (5432) from VPC CIDR (10.0.0.0/16)
- PostgreSQL (5432) from Lambda security group
- PostgreSQL (5432) from bastion security group

Outbound:
- None required
```

## 🔧 Development Workflow

### **Local Development Access**
1. **Start SSH tunnel** to bastion host
2. **Connect through tunnel** on localhost:5434
3. **Run migrations/scripts** through tunnel
4. **Import USDA data** through tunnel

### **Lambda Function Access**
- **Direct VPC connection** to RDS
- **No tunnel required** (within VPC)
- **Environment variables** for connection details

### **Production Deployment**
- **Lambda functions** auto-deploy within VPC
- **Database migrations** run through bastion
- **Monitoring** via CloudWatch (VPC Flow Logs)

## 📊 Cost Optimization

### **Free Tier Usage**
- **RDS db.t3.micro**: Free tier eligible
- **EC2 t3.micro**: Free tier eligible (bastion)
- **VPC**: No additional charges
- **Data Transfer**: Minimal within VPC

### **Current Monthly Costs**
```
RDS db.t3.micro: $0 (free tier)
EC2 t3.micro: $0 (free tier)
EBS Storage (20GB): $0 (free tier)
VPC/Subnets: $0
NAT Gateway: ~$32/month (if needed for Lambda)
```

## 🛠️ Troubleshooting

### **Common Issues**

#### **SSH Tunnel Connection Failed**
```bash
# Check bastion host status
aws ec2 describe-instances --filters "Name=tag:Name,Values=*bastion*"

# Verify security group allows your IP
aws ec2 describe-security-groups --group-ids sg-038e1f4df68d428d4
```

#### **Database Connection Timeout**
```bash
# Test tunnel connectivity
telnet 127.0.0.1 5434

# Check RDS status
aws rds describe-db-instances --db-instance-identifier health-platform-dev-db
```

#### **Lambda VPC Connectivity Issues**
- **Check VPC configuration** in Lambda console
- **Verify security groups** allow Lambda → RDS
- **Check NAT Gateway** for external API calls

### **Monitoring & Logs**

#### **VPC Flow Logs**
```bash
# Enable VPC Flow Logs
aws ec2 create-flow-logs \
    --resource-type VPC \
    --resource-ids vpc-12345678 \
    --traffic-type ALL \
    --log-destination-type cloud-watch-logs \
    --log-group-name VPCFlowLogs
```

#### **RDS Monitoring**
- **CloudWatch Metrics**: CPU, connections, storage
- **Performance Insights**: Query performance
- **Log Files**: PostgreSQL logs via AWS console

## 🔄 Maintenance Tasks

### **Weekly**
- **Check bastion host** health and updates
- **Monitor RDS** performance metrics
- **Review VPC Flow Logs** for anomalies

### **Monthly**
- **Update bastion host** packages
- **Review security groups** and access patterns
- **Optimize costs** and resource usage

### **Quarterly**
- **Security audit** of VPC configuration
- **Performance review** of database queries
- **Disaster recovery** testing

## 🚨 Security Best Practices

### **Access Control**
1. **Bastion host** access from specific IP addresses only
2. **SSH key rotation** every 90 days
3. **Database passwords** stored in AWS Secrets Manager
4. **VPC Flow Logs** enabled for monitoring

### **Network Security**
1. **Private subnets** for all data storage
2. **Security groups** with minimal required access
3. **NACLs** for additional network-level security
4. **VPC endpoints** for AWS service access

### **Monitoring & Alerting**
1. **CloudWatch alarms** for unusual activity
2. **AWS Config** for configuration compliance
3. **AWS GuardDuty** for threat detection
4. **Regular security assessments**

---

**Last Updated**: July 27, 2025  
**VPC ID**: vpc-22473a58  
**Bastion Host**: i-0421d8ff38885a350  
**RDS Endpoint**: health-platform-dev-db.c5njva4wrrhe.us-east-1.rds.amazonaws.com
