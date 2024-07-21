# Auth Endpoint

## Login

<li> Method: POST
<li> Endpoint: /auth/login

#### Request
```json
{
    "username" : "jhondea",
    "password" : "admin#1234"
}
```

#### Response 
```json
{
    "token" : "xxxxxx"
}
```

<br>

## Register

<li> Method : POST
<li> Endpoint: /auth/register

#### Request
```json
{
    "name": "Jhon Dea",
    "username" : "jhondea",
    "password" : "admin#1234"
}
```

#### Response 
```json
{
    "useranme": "jhondea"
}
```

<br>
