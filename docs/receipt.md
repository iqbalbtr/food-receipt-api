# Recipes

## Create Recipe

<li> Method: POST
<li> Endpoint: /api/recipes

#### Request
```json
{
    
}
```

#### Response 
```json
{
    
}
```

<br>

## Get List Recipe

<li> Method: GET
<li> Endpoint: /api/recipes

#### Query
```json
{
    "take": number,
    "page": number,
    "popular": "asc" | "desc",
}
```

#### Response 
```json
{
    "page": 1,
    "take": 2,
    "pageCount": 2,
    "itemCount": 3,
    "list": [
        {
            "id": 1,
            "title": "Nasi Goreng",
            "sub_title": "Woilah mantap sekali",
            "receipt_liked": 1,
            "tags": null,
            "create_at": "--",
            "creator": {
                "username": "iqbalbtr",
                "name": "iqbal"
            }
        }
    ]
}
```

<br>