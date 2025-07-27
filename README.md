# Second Hand Marketplace API

A comprehensive second-hand marketplace platform API with user management, product listings, and transaction support.

##  Quick Start (Recommended for Development)

### Prerequisites
- Docker installed
- Java 21 and Maven (or use IDE)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd secondHand
```

### 2. Start PostgreSQL Database
```bash
# Single Docker command - no docker-compose needed
docker run -d \
  --name secondhand-postgres \
  -e POSTGRES_DB=secondhand \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=1234 \
  -p 5433:5432 \
  -v secondhand_postgres_data:/var/lib/postgresql/data \
  postgres:latest
```

### 4. Access the Application
- **API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Database**: localhost:5433 (postgres/1234/secondhand)

## 🐳 Database Setup

### PostgreSQL Database
- **Container**: `secondhand-postgres`
- **Port**: `5433` (to avoid conflicts)
- **Database**: `secondhand`
- **Credentials**: Built into the Docker run command

### Spring Boot Application
- **Environment**: Local development (IDE)
- **Port**: `8080`
- **Profile**: `dev`

## 📝 Development Commands

```bash
# Start database
docker run -d --name secondhand-postgres \
  -e POSTGRES_DB=secondhand \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=1234 \
  -p 5433:5432 \
  -v secondhand_postgres_data:/var/lib/postgresql/data \
  postgres:latest

# Stop database
docker stop secondhand-postgres

# Remove container (keeps data)
docker rm secondhand-postgres

# Remove all data (⚠️ Warning: This will delete all database data)
docker volume rm secondhand_postgres_data

# View database logs
docker logs -f secondhand-postgres

# Check database status
docker ps | grep secondhand-postgres
```

## 🔧 Database Connection

Connection details are automatically configured in `application-dev.properties` for local development. No manual configuration needed.

## 🏗️ Project Structure

```
secondHand/
├── src/main/java/com/serhat/secondhand/
│   ├── config/          # Configuration classes
│   ├── entity/          # JPA entities
│   └── SecondHandApplication.java
├── docker-compose.yml   # Docker services configuration
├── Dockerfile          # Application container
└── README.md
```

## 📊 Database Schema

The application uses PostgreSQL with Hibernate for ORM. Tables are automatically created using `spring.jpa.hibernate.ddl-auto=update`.

### User Entity
- `id` (Long, Primary Key)
- `name` (String, Not Null)
- `surname` (String, Not Null)
- `email` (String, Unique, Not Null)
- `password` (String, Not Null)
- `gender` (Enum: MALE/FEMALE)
- `birthdate` (LocalDate, Format: dd/MM/yyyy)

### Sample Data
The application automatically loads sample users on startup via `data.sql`:
- 5 test users with different profiles
- All users have password: `password123`
- Consistent data across all development environments

## 🌐 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## 🔄 Date Format Configuration

Dates are configured with:
- **JSON Format**: `dd/MM/yyyy HH:mm`
- **Timezone**: GMT+3 (Turkey)
- **Database Format**: YYYY-MM-DD (ISO 8601)

## 🛠️ Troubleshooting

### Port Conflicts
If ports are already in use, modify `docker-compose.yml`:
```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Change from 5432 to 5433
```

### Database Connection Issues
1. Ensure PostgreSQL container is healthy:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

### Application Startup Issues
1. Check application logs:
   ```bash
   docker-compose logs secondhand-app
   ```

2. Rebuild the application:
   ```bash
   docker-compose build secondhand-app
   docker-compose up secondhand-app
   ```

## 🤝 Team Setup

New team members can get started in 3 steps:
1. Clone the repository
2. Run `docker-compose up -d`
3. Access http://localhost:8080/swagger-ui.html

No local PostgreSQL installation required! 🎉

## 🔒 Security Notes

**Development Environment:**
- Database credentials are visible in the Docker run command for development convenience
- These are **NOT production credentials**
- For production, use environment variables or secure secrets management

**Important:**
- Never commit production credentials to version control
- Use `.env` files or CI/CD secrets for production deployments 


docker run -d --name secondhand-postgres -e POSTGRES_DB=secondhand -e POSTGRES_USER=postgres  -e POSTGRES_PASSWORD=1234 -p 5433:5432 postgres:latest