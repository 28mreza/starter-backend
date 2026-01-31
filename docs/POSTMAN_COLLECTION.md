# 📮 Postman Collection Guide

Panduan lengkap untuk testing API menggunakan Postman.

## 🔧 Setup Postman Environment

### 1. Buat Environment Baru

Buat environment dengan variables berikut:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| base_url | http://localhost:3000/api | http://localhost:3000/api |
| access_token | | (akan di-set otomatis setelah login) |
| refresh_token | | (akan di-set otomatis setelah login) |

### 2. Import Collection

Copy JSON collection di bawah ini dan import ke Postman.

---

## 📝 Postman Collection JSON

```json
{
  "info": {
    "name": "iVendor SuperApps API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Password123!\",\n  \"name\": \"Test User\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/register",
              "host": ["{{base_url}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set(\"access_token\", jsonData.data.tokens.accessToken);",
                  "    pm.environment.set(\"refresh_token\", jsonData.data.tokens.refreshToken);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"superadmin@example.com\",\n  \"password\": \"Password123!\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            }
          }
        },
        {
          "name": "Refresh Token",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set(\"access_token\", jsonData.data.accessToken);",
                  "    pm.environment.set(\"refresh_token\", jsonData.data.refreshToken);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"refreshToken\": \"{{refresh_token}}\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/refresh",
              "host": ["{{base_url}}"],
              "path": ["auth", "refresh"]
            }
          }
        },
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/auth/profile",
              "host": ["{{base_url}}"],
              "path": ["auth", "profile"]
            }
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"refreshToken\": \"{{refresh_token}}\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/logout",
              "host": ["{{base_url}}"],
              "path": ["auth", "logout"]
            }
          }
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/users?page=1&limit=10",
              "host": ["{{base_url}}"],
              "path": ["users"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          }
        },
        {
          "name": "Get User by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/users/1",
              "host": ["{{base_url}}"],
              "path": ["users", "1"]
            }
          }
        },
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"newuser@example.com\",\n  \"password\": \"Password123!\",\n  \"name\": \"New User\",\n  \"is_active\": true,\n  \"roleIds\": [4]\n}"
            },
            "url": {
              "raw": "{{base_url}}/users",
              "host": ["{{base_url}}"],
              "path": ["users"]
            }
          }
        },
        {
          "name": "Update User",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Updated Name\",\n  \"is_active\": true\n}"
            },
            "url": {
              "raw": "{{base_url}}/users/5",
              "host": ["{{base_url}}"],
              "path": ["users", "5"]
            }
          }
        },
        {
          "name": "Delete User",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/users/5",
              "host": ["{{base_url}}"],
              "path": ["users", "5"]
            }
          }
        },
        {
          "name": "Assign Roles to User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"roleIds\": [2, 3]\n}"
            },
            "url": {
              "raw": "{{base_url}}/users/5/roles",
              "host": ["{{base_url}}"],
              "path": ["users", "5", "roles"]
            }
          }
        }
      ]
    },
    {
      "name": "Roles",
      "item": [
        {
          "name": "Get All Roles",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/roles?page=1&limit=10",
              "host": ["{{base_url}}"],
              "path": ["roles"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          }
        },
        {
          "name": "Get Role by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/roles/1",
              "host": ["{{base_url}}"],
              "path": ["roles", "1"]
            }
          }
        },
        {
          "name": "Create Role",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Editor\",\n  \"slug\": \"editor\",\n  \"description\": \"Content editor role\",\n  \"permissionIds\": [1, 2, 3]\n}"
            },
            "url": {
              "raw": "{{base_url}}/roles",
              "host": ["{{base_url}}"],
              "path": ["roles"]
            }
          }
        },
        {
          "name": "Update Role",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Senior Editor\",\n  \"description\": \"Senior content editor\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/roles/5",
              "host": ["{{base_url}}"],
              "path": ["roles", "5"]
            }
          }
        },
        {
          "name": "Delete Role",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/roles/5",
              "host": ["{{base_url}}"],
              "path": ["roles", "5"]
            }
          }
        },
        {
          "name": "Assign Permissions to Role",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"permissionIds\": [1, 2, 3, 4, 5]\n}"
            },
            "url": {
              "raw": "{{base_url}}/roles/5/permissions",
              "host": ["{{base_url}}"],
              "path": ["roles", "5", "permissions"]
            }
          }
        }
      ]
    },
    {
      "name": "Permissions",
      "item": [
        {
          "name": "Get All Permissions",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/permissions?page=1&limit=10",
              "host": ["{{base_url}}"],
              "path": ["permissions"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          }
        },
        {
          "name": "Get Permission by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/permissions/1",
              "host": ["{{base_url}}"],
              "path": ["permissions", "1"]
            }
          }
        },
        {
          "name": "Create Permission",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Create Posts\",\n  \"slug\": \"posts.create\",\n  \"resource\": \"posts\",\n  \"action\": \"create\",\n  \"description\": \"Permission to create posts\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/permissions",
              "host": ["{{base_url}}"],
              "path": ["permissions"]
            }
          }
        },
        {
          "name": "Update Permission",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Create Blog Posts\",\n  \"description\": \"Updated description\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/permissions/31",
              "host": ["{{base_url}}"],
              "path": ["permissions", "31"]
            }
          }
        },
        {
          "name": "Delete Permission",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/permissions/31",
              "host": ["{{base_url}}"],
              "path": ["permissions", "31"]
            }
          }
        },
        {
          "name": "Get All Resources",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/permissions/resources",
              "host": ["{{base_url}}"],
              "path": ["permissions", "resources"]
            }
          }
        },
        {
          "name": "Get Grouped Permissions",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/permissions/grouped",
              "host": ["{{base_url}}"],
              "path": ["permissions", "grouped"]
            }
          }
        },
        {
          "name": "Bulk Create Permissions",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"resource\": \"posts\",\n  \"actions\": [\"create\", \"read\", \"update\", \"delete\", \"view\"]\n}"
            },
            "url": {
              "raw": "{{base_url}}/permissions/bulk",
              "host": ["{{base_url}}"],
              "path": ["permissions", "bulk"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🚀 Cara Menggunakan

### 1. Login Otomatis Set Token

Request **Login** sudah di-setup untuk otomatis menyimpan `access_token` dan `refresh_token` ke environment variables.

Test script yang digunakan:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.data.tokens.accessToken);
    pm.environment.set("refresh_token", jsonData.data.tokens.refreshToken);
}
```

### 2. Authorization Header Otomatis

Semua protected endpoints sudah menggunakan:
```
Authorization: Bearer {{access_token}}
```

Token akan otomatis diambil dari environment variable.

### 3. Testing Flow

1. **Login** terlebih dahulu
2. Token otomatis tersimpan
3. Test endpoints lainnya
4. Jika token expired, gunakan **Refresh Token**
5. Token baru otomatis tersimpan lagi

---

## 📝 Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    // error details
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success message",
  "data": [
    // array of items
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🔗 Import Collection

1. Buka Postman
2. Click **Import**
3. Copy JSON collection di atas
4. Paste dan click **Import**
5. Setup environment variables
6. Mulai testing! 🚀
