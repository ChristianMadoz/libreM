from fastapi import FastAPI
app = FastAPI()
@app.get("/api/test")
def test():
    return {"hello": "world"}
@app.get("/{path:path}")
def catch_all(path: str):
    return {"path": path, "message": "hello from catch all"}