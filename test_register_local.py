import urllib.request
import json

def test_register():
    url = 'http://127.0.0.1:8000/api/auth/register'
    data = json.dumps({
        "name": "Test User",
        "email": "testregister_local@example.com",
        "password": "password123"
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers={
        'Content-Type': 'application/json'
    })
    
    try:
        with urllib.request.urlopen(req) as f:
            print("Status Code:", f.getcode())
            print("Response:", f.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code)
        print("Response:", e.read().decode('utf-8'))
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    test_register()
