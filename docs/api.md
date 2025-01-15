# BreezeCloud API Documentation

## Authentication

### Login
**POST** `/api/v1/login`

Authenticates a user and returns a JWT token and also sets it in the 'auth' cookie.
## The cookie is needed for all operations, except some (I will tell you which dw)

**Request Body:**
```json
{
    "username": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "user": {
        "id": "string",
        "email": "string",
        "fullName": "string", 
        "username": "string"
    },
    "token": "string"
}
```

### Register 
**POST** `/api/v1/register`

Creates a new user account.

**Request Body:**
```json
{
    "username": "string",
    "fullName": "string",
    "email": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "message": "Registration successful"
}
```

## File Operations

### List files
**GET** `/api/v1/ls`

Lists the file tree of the user, contains all information about files, folders, space...
#### Request Body not needed

**Example Response:**
```json
{
	"files": {
		"thisIsAFolder": {
			"type": "folder",
			"children": {
				"README.md": {
					"size": 2580,
					"type": "file",
					"public": false,
					"modified": "2025-01-11T21:26:56.868Z"
				},
				"index.html": {
					"size": 300,
					"type": "file",
					"public": false,
					"modified": "2025-01-08T20:47:56.158Z"
				}
			}
		},
		"john": {
			"type": "folder",
			"children": {
				"big": {
					"type": "folder",
					"children": {
						"john.jpg": {
							"size": 66941,
							"type": "file",
							"public": false,
							"modified": "2025-01-09T16:39:50.137Z"
						}
					}
				}
			}
		},
		"Gary1.jpg": {
			"size": 515531,
			"type": "file",
			"public": false,
			"modified": "2025-01-08T18:14:27.229Z"
		}
	}
}
```
#### size is in bytes, public refers on the visibility of the file (if it can be seen from everyone)

### Upload File
**POST** `/api/v1/upload`

Uploads one or more files. Uses multipart/form-data.

**Request Body:**
- `file`: File(s) to upload
- `folder`: Target folder path (optional)

**Response:**
```json
{
    "message": "Files uploaded successfully"
}
```

### Create Folder
**POST** `/api/v1/upload/folder`

Creates a new folder.

**Request Body:**
```json
{
    "folderPath": "string"
}
```

### Authenticated download File
**GET** `/api/v1/public/download?file=FILEPATHHERE`

Downloads a file.

**Query Parameters:**
- `file`: File path

### Delete File
**DELETE** `/api/v1/delete`

Deletes a file.

**Request Body:**
```json
{
    "filename": "string"
}
```

### Rename File
**POST** `/api/v1/rename`

Renames a file or folder.

**Request Body:**
```json
{
    "oldPath": "string",
    "newPath": "string"
}
```

### Toggle File Visibility
**POST** `/api/v1/visibility`

Toggles file public/private visibility.

**Request Body:**
```json
{
    "filePath": "string",
    "isPublic": "boolean"
}
```

### Unauthenticated File downloading
#### No auth cookie needed
**GET** `/api/v1/public/download?file=FILEPATHHERE`

Endpoint for downloading publicly shared files without authentication.
#### Has to have public set to true via `/api/v1/visibility`, see if it is public by looking at the file's 'public' property in the file tree (see `/api/v1/ls`)
**Query Parameters:**
- `file`: File path

