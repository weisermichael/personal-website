// Simple script for resume website
// Add any interactive features here if needed

console.log("Resume website loaded.");

const counter = document .querySelector(".counter-number");
async function updateCounter() {
    let response = await fetch("https://f6h5vxmxnalzynul32fctncntq0knwca.lambda-url.us-west-2.on.aws/");
    let data = await response.json();
    counter.innerHTML = ` Views: ${data}`;
}

updateCounter();
