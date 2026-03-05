import urllib.request

def test_health():
    url = 'https://e5qh9i8z.us-east.insforge.app/api/health'
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as f:
            print("Status Code:", f.getcode())
            print("Response:", f.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code)
        print("Response:", e.read().decode('utf-8'))
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    test_health()
