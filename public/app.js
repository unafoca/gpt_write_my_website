async function submitData() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const email = document.getElementById("email").value;

  const response = await fetch('/submitData', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, age, email}),
  });

  if (response.ok) {
    const data = await response.json();
    console.log(data.message);

    // Update the "Submitted Data" section
    const submittedDataList = document.getElementById("submittedData");
    const existingListItem = document.getElementById("latestData");

    if (existingListItem) {
      existingListItem.textContent = `${name} is ${age} years old`;
    } else {
      const listItem = document.createElement("li");
      listItem.id = "latestData";
      listItem.textContent = `${name} is ${age} years old`;
      submittedDataList.appendChild(listItem);
    }

    // Clear the input fields
    document.getElementById("name").value = "";
    document.getElementById("age").value = "";
    document.getElementById("email").value = "";
  } else {
    console.error(`Error: ${response.status}`);
  }
}

async function searchAge() {
  const name = document.getElementById("searchName").value;

  const response = await fetch(`/searchAge/${name}`);

  if (response.ok) {
    const data = await response.json();
    console.log(data.message);
    document.getElementById("searchResult").textContent = data.message;
  } else {
    const data = await response.json();
    const errorMessage = response.status === 404 ? `No record found for ${name}` : data.message;
    document.getElementById("searchResult").textContent = errorMessage;
  }
}

async function clearData() {
  const response = await fetch('/clearData', { method: 'POST' });

  if (response.ok) {
    const data = await response.json();
    console.log(data.message);

    // Clear the submitted data list on the webpage
    const submittedDataList = document.getElementById('submittedData');
    submittedDataList.innerHTML = '';
  } else {
    console.error(`Error: ${response.status}`);
  }
}
