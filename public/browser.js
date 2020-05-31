function itemTemplate(item) {
  return `
  <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
   <span class="item-text">${item.text}</span>
    <div>
      <button class="edit-me btn btn-secondary btn-sm mr-1" data-id="${item._id}">Edit</button>
      <button class="delete-me btn btn-danger btn-sm" data-id="${item._id}">Delete</button>
    </div>
  </li>`
}

let tempHTML = items
  .map(function (item) {
    return itemTemplate(item)
  })
  .join("")

//Initial Page Load Render
document.getElementById("item-list").insertAdjacentHTML("beforeend", tempHTML)

//Create Feature
let newItemInput = document.getElementById("new-item-input")
document.getElementById("create-form").addEventListener("submit", e => {
  e.preventDefault()
  if (newItemInput.value) {
    axios
      .post("/create-item", { text: newItemInput.value })
      .then(res => {
        //receive data of newly added item, and create the HTML for it
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(res.data))
        // for user experience
        newItemInput.value = ""
        newItemInput.focus()
      })
      .catch(() => {
        console.log("Please try again later")
      })
  } else {
    alert("Please type some content.  :)")
  }
})

//Item number may be quite large, so add event listener to document instead of individual buttons.
document.addEventListener("click", e => {
  //Delete Feature
  if (e.target.classList.contains("delete-me")) {
    if (confirm("Do you really want to delete this item permanently?")) {
      axios
        .post("/delete-item", { id: e.target.getAttribute("data-id") })
        .then(() => {
          e.target.parentElement.parentElement.remove()
        })
        .catch(() => {
          console.log("Please try again later")
        })
    }
  }

  //Update Feature
  if (e.target.classList.contains("edit-me")) {
    // fill in original text as default value
    userInput = prompt("Enter your desired new text", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
    // when user click cancel there's no need to update text content
    if (userInput) {
      axios
        .post("/update-item", { text: userInput, id: e.target.getAttribute("data-id") })
        .then(() => {
          e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
        })
        .catch(() => {
          console.log("Please try again later")
        })
    }
  }
})
