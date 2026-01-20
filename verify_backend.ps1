$ErrorActionPreference = "Stop"

Write-Host "Starting Backend..."
$env:PYTHONPATH = "backend"
$process = Start-Process -FilePath "uvicorn" -ArgumentList "backend.server:app", "--port", "8000" -PassThru -NoNewWindow
Start-Sleep -Seconds 10

try {
    Write-Host "Verifying Products..."
    $resp = Invoke-RestMethod -Uri "http://localhost:8000/api/products"
    if ($resp.products.Count -ge 10) { 
        Write-Host "✅ Products Verified ($($resp.products.Count) items found)" 
    } else { 
        Write-Host "❌ Products Failed (Found $($resp.products.Count))" 
    }

    Write-Host "Verifying Categories..."
    $resp2 = Invoke-RestMethod -Uri "http://localhost:8000/api/categories"
    if ($resp2.categories.Count -ge 5) { 
        Write-Host "✅ Categories Verified ($($resp2.categories.Count) items found)" 
    } else { 
        Write-Host "❌ Categories Failed (Found $($resp2.categories.Count))" 
    }
} catch {
    Write-Host "❌ Error verifying endpoints: $_"
} finally {
    Stop-Process -Id $process.Id -Force
    Write-Host "Backend stopped."
}
