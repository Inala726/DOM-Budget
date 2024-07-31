// Utility function to format currency
const formatCurrency = (value) => {
  return `$${parseFloat(value).toFixed(2)}`;
};

let totalAmount = document.getElementById("total-amount");
const errorMessage = document.getElementById("budget-error");
const setBudget = document.getElementById("total-amount-button");
const productTitleError = document.getElementById("product-title-error");
const productTitle = document.getElementById("product-title");
let userAmount = document.getElementById("user-amount");
const checkAmountBtn = document.getElementById("check-amount");
const amount = document.getElementById("amount");
const balance = document.getElementById("balance");
const expenditure = document.getElementById("expenditure");
const list = document.getElementById("list");

let tempAmount = 0;
let expenseArray = [];

// Load data from local storage
window.onload = () => {
  const storedBudget = localStorage.getItem("budget");
  const storedExpenses = localStorage.getItem("expenses");

  if (storedBudget) {
    tempAmount = parseFloat(storedBudget);
    amount.innerHTML = formatCurrency(tempAmount);
    updateExpenditure();
  }

  if (storedExpenses) {
    expenseArray = JSON.parse(storedExpenses);
    expenseArray.forEach((expense) => {
      createList(expense.name, formatCurrency(expense.value));
    });
    updateExpenditure();
  }
};

// Set budget
setBudget.addEventListener("click", () => {
  tempAmount = parseFloat(totalAmount.value);

  // empty or negative value
  if (isNaN(tempAmount) || tempAmount < 0) {
    errorMessage.classList.remove("hide");
  } else {
    errorMessage.classList.add("hide");
    amount.innerHTML = formatCurrency(tempAmount);
    balance.innerText = formatCurrency(
      tempAmount - parseFloat(expenditure.innerText.replace("$", ""))
    );

    // Save to local storage
    localStorage.setItem("budget", tempAmount);

    totalAmount.value = "";
    updateExpenditure();
  }
});

// Disable edit buttons
const disableBtns = (bool) => {
  let editBtns = document.getElementsByClassName("edit");
  Array.from(editBtns).forEach((element) => {
    element.disabled = bool;
  });
};

// Modify list elements
const modifyElements = (element, edit = true) => {
  let parentDiv = element.closest(".sublist-content");
  let currentBalance = parseFloat(balance.innerText.replace("$", ""));
  let currentExpense = parseFloat(expenditure.innerText.replace("$", ""));
  let parentAmount = parseFloat(
    parentDiv.querySelector(".amount").innerText.replace("$", "")
  );
  let parentText = parentDiv.querySelector(".product").innerText;

  if (edit) {
    productTitle.value = parentText;
    userAmount.value = parentAmount;
    disableBtns(true);
  }
  balance.innerText = formatCurrency(currentBalance + parentAmount);
  expenditure.innerText = formatCurrency(currentExpense - parentAmount);
  parentDiv.remove();

  // Remove from expense array
  expenseArray = expenseArray.filter(
    (expense) => !(expense.name === parentText && expense.value == parentAmount)
  );
  localStorage.setItem("expenses", JSON.stringify(expenseArray));
};

// Create list
const createList = (expenseName, expenseValue) => {
  let subListContent = document.createElement("div");
  subListContent.classList.add("sublist-content", "flex-space");
  list.appendChild(subListContent);
  subListContent.innerHTML = `
      <p class="product">${expenseName}</p>
      <p class="amount">${expenseValue}</p>
      <div class="icons-container">
        <button class="fa-solid fa-pen-to-square edit" style="font-size: 18px;"></button>
        <button class="fa-solid fa-trash delete" style="font-size: 18px;"></button>
      </div>
    `;

  let editButton = subListContent.querySelector(".edit");
  editButton.addEventListener("click", () => {
    modifyElements(editButton, true);
  });

  let deleteBtn = subListContent.querySelector(".delete");
  deleteBtn.addEventListener("click", () => {
    modifyElements(deleteBtn, false);
    updateExpenditure();
  });
};

// Add expenses
checkAmountBtn.addEventListener("click", () => {
  if (!userAmount.value || !productTitle.value) {
    productTitleError.classList.remove("hide");
    return false;
  }
  productTitleError.classList.add("hide");
  disableBtns(false);

  let expense = parseFloat(userAmount.value);
  expenseArray.push({ name: productTitle.value, value: expense });

  // Save to local storage
  localStorage.setItem("expenses", JSON.stringify(expenseArray));

  createList(productTitle.value, formatCurrency(expense));
  updateExpenditure();
  productTitle.value = "";
  userAmount.value = "";
});

// Update expenditure and balance
const updateExpenditure = () => {
  let totalExpenses = expenseArray.reduce(
    (acc, expense) => acc + parseFloat(expense.value),
    0
  );
  expenditure.innerText = formatCurrency(totalExpenses);
  const totalBalance = tempAmount - totalExpenses;
  balance.innerText = formatCurrency(totalBalance);
};
