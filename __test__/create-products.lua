wrk.method = "POST"
wrk.body   = '{"name": "hello world", "price": 12.37}' 
wrk.headers["Content-Type"] = "application/json"
wrk.headers["Authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlblNlZWQiOiIwZjg3NzU1NzIyY2JjZjBhOTAzMjI2N2M0ODI3ZjdjYjVkZWFmMDBkYjA1NjBhMmFiYWQwNGE3ZTIyMjE0Nzc2NWMxMWFiY2E0OTZjYmVhZDE5NmE5MmIzZTI3NTE5MzVmMWY1NDhhMzRhYTRkOWYyNTZiZTY5NzZmNTAzOWU4MyIsImlhdCI6MTUxMDk0MTM4NCwiZXhwIjoxNTExNTQ2MTg0fQ.DOMgcK3-cPdlxBnH8sSP3gGPPuu40qkPFx6yBskqJaA"