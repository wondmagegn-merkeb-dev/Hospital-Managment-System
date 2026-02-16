from fastapi import FastAPI

app = FastAPI(
    title="Hospital Management API",
    description="An API for managing hospital operations",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "Hospital Management System API is running"}
