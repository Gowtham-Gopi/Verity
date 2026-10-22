
from selenium import webdriver
import os

driver = webdriver.Chrome()

try:
    driver.get("http://localhost:5173")  # Replace with your website URL

    # Save screenshot in the same folder as the script's working directory
    path = os.path.abspath("website_screenshot.png")

    success = driver.save_screenshot(path)

    print("Screenshot saved:", success)
    print("Full path:", path)
    print("File exists:", os.path.exists(path))

finally:
    driver.quit()
