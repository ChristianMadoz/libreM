from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "minimal-ok"}

@app.get("/{full_path:path}")
def catch_all(full_path: str):
    return {"status": "minimal-ok", "path": full_path}
