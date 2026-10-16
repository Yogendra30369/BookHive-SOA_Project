# Archivalia Digital Libraries - Backend Microservices Architecture

## Microservices Overview & Ports

| Service | Port | Description | Database |
| :--- | :--- | :--- | :--- |
| **Eureka Server** | `8761` | Service Registry & Discovery | None |
| **API Gateway** | `8080` | Central routing, load balancing & CORS | None |
| **Auth Service** | `8081` | JWT authentication & user accounts | `archivalia_auth` |
| **Book Service** | `8082` | Catalog, inventory & copy management | `archivalia_books` |
| **Borrow Service** | `8083` | Reserve, active loans & collection lifecycle | `archivalia_borrows` |
| **Fine Service** | `8084` | Overdue fee calculations & settlement | `archivalia_fines` |

---

## 1. Database Setup (pgAdmin 4)
Open **pgAdmin 4**, right-click **Databases** (or open the Query Tool) and run `init_databases.sql`:
```sql
CREATE DATABASE archivalia_auth;
CREATE DATABASE archivalia_books;
CREATE DATABASE archivalia_borrows;
CREATE DATABASE archivalia_fines;
```
> **Note on Password:** The `application.properties` in each service uses `username=postgres` and `password=postgres`. If your PostgreSQL password in pgAdmin is different, update the password in each service's `src/main/resources/application.properties`.

---

## 2. Import into Spring Tool Suite (STS)
1. Open **Spring Tool Suite (STS)**.
2. Click **File -> Import...**
3. Select **Maven -> Existing Maven Projects** and click **Next**.
4. Set **Root Directory** to `C:\SOA PROJECT BACKEND`.
5. STS will detect all 6 projects:
   - `eureka-server`
   - `api-gateway`
   - `auth-service`
   - `book-service`
   - `borrow-service`
   - `fine-service`
6. Click **Finish**. STS will resolve all Maven dependencies automatically.

---

## 3. Order of Starting the Services
Always start them in this sequence:
1. **`EurekaServerApplication`** (Wait until http://localhost:8761 opens)
2. **`BookServiceApplication`**
3. **`FineServiceApplication`**
4. **`BorrowServiceApplication`**
5. **`AuthServiceApplication`**
6. **`ApiGatewayApplication`**

Once running, all microservices will register in Eureka Dashboard at `http://localhost:8761`, and all API requests can be routed through `http://localhost:8080/api/...`.
