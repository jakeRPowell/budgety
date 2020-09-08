//////////////////////////////////////////////////////////////////////
// Budget Controller
//////////////////////////////////////////////////////////////////////
const budgetController = (function() {
    
    //function constructors allow you to create lots of objects
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(el) {
            sum += el.value;
        })
        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        //we use -1 to say something is non-existent, a falsy value
        percentage: -1
    };



    return {
        addItem: function(type, desc, val) {
            //create new item and id instance            
            let newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //create new item based on type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === "inc") {
                newItem = new Income(ID, desc, val)
            }
            //push to data
            // console.log(data.allItems.inc);
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },

        deleteDataItem: function(type, ID) {
            //create a copy of desired array
            let newArray = [...data.allItems[type]];
            //map all items, return IDs
            let ids = newArray.map(el => {return el.id});
            //using new ids array, find the index of item ID (so no matter where it is we find the index)
            let index = ids.indexOf(ID);
            //splice new array using this index variable
            newArray.splice(index, 1);
            //push new data to data structure
            data.allItems[type] = newArray;
        },

        calculateBudget: function() {
            //calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            //calculate budget: income minus expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate % of income spent
            //make sure we don't get 'infinity' where you divide by 0
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(el) {
                el.calculatePercentage(data.totals.inc);
            })
        },

        getPercentages: function() {
            let allPercentages = data.allItems.exp.map(function(el) {
                return el.getPercentage();
            })
            return allPercentages;
        },

        getBudget: function() {
          return {
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              budget: data.budget,
              percentage: data.percentage
          }
        },

        testing: function() {
            console.log(data)
        }
    }


})();

//////////////////////////////////////////////////////////////////////
//UI Controller
//////////////////////////////////////////////////////////////////////

const uiController = (function() {

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetValueLabel: '.budget__value',
        budgetIncomeLabel: '.budget__income--value',
        budgetExpensesLabel: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    let NodeListForEach = function(list, callback) {
        for(let i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    };

    let formatNumber = function(num, type) {
        //+ or - before number
        //two decimal points
        //comma seperating thousands
        let numSplit,int,dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,int.length);
        }
        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc/exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            //create HTML string with placeholder text
            let html, newHTML, element;
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%ID%">
                <div class="item__description">%DESCRIPTION%</div>
                <div class="right clearfix">
                    <div class="item__value">%VALUE%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn">
                                <i class="ion-ios-close-outline"></i>
                            </button>
                        </div>
                    </div>
                </div>`
            } else {
                element = DOMstrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-%ID%">
                <div class="item__description">%DESCRIPTION%</div>
                <div class="right clearfix">
                    <div class="item__value">%VALUE%</div>
                    <div class="item__percentage">%PERCENTAGE%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`
            }
        
            //replace placeholder with actual data
            newHTML = html.replace('%ID%', obj.id);
            newHTML = newHTML.replace('%DESCRIPTION%', obj.description);
            newHTML = newHTML.replace('%VALUE%', formatNumber(obj.value, type));

            //insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        
        resetFields: function() {
            let fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            //in this callback function, you can access current value, index and the entire array (here field is current element)
            fieldsArray.forEach(function(field) {
                field.value = "";
            });
            fieldsArray[0].focus();
        },
        
        displayBudget: function (obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            //these come from the getBudget method
            document.querySelector(DOMstrings.budgetIncomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.budgetExpensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.budgetValueLabel).textContent = formatNumber(obj.budget, type)


            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentage).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentage).textContent = "---";
            }    
        },

        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            
            NodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'
                 } else {
                    current.textContent = '---'
                 }
            })
        },

        displayMonth: function() {
            let now,year,month;
            now = new Date();            
            month = now.toLocaleString('en', { month: 'long' });
            year = now.getFullYear();
            
            console.log(year);
            document.querySelector(DOMstrings.dateLabel).textContent = month + ', ' + year;
        },

        deleteUIItem: function(itemID) {
            let target = document.getElementById(itemID);
            target.parentNode.removeChild(target);
        },

        changeType: function() {
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
                );
            NodeListForEach(fields, function(el) {
                //toggle adds or removes class
                el.classList.toggle('red-focus');
            })
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings
        }
    }
})()

//////////////////////////////////////////////////////////////////////
//App Controller
//delegates tasks to the other controllers
//////////////////////////////////////////////////////////////////////
const appController = (function(budgetCtrl, uiCtrl) {

    const setupEventListeners = function() {
        const DOM = uiCtrl.getDOMstrings();
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if (event.key === "Enter") {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType);
        
    }

    const updateBudget = function() {
        //1. calculate budget
        budgetCtrl.calculateBudget();
        //2. Return budget
        let budget = budgetCtrl.getBudget();
        //3. display budget on UI
        uiCtrl.displayBudget(budget);
    }

    const updatePercentages = function() {
        //calculate percentages
        budgetCtrl.calculatePercentages();
        //read percentages from budget controller
        let percentages = budgetCtrl.getPercentages();
        //update UI
        uiCtrl.displayPercentages(percentages);
    }

    const ctrlAddItem = function() {
        
        let input, newItem;

        //1. get field input data
        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)
            //3. Add the new item to UI
            uiCtrl.addListItem(newItem, input.type);
            //4. clear fields
            uiCtrl.resetFields();
            //calculate and update budget
            updateBudget();
            //update percentages
            updatePercentages();
        }     
    }

    const ctrlDeleteItem = function(event) {
        let itemID,splitId,type,ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitId = itemID.split('-');
            type = splitId[0];
            ID = splitId[1];

            //delete item from data structure
            budgetCtrl.deleteDataItem(type, ID);
            //delete item from ui
            uiCtrl.deleteUIItem(itemID);
            //update and show new budget
            updateBudget();
            //update percentages
            updatePercentages();
        }
        
    }

    return {
        init: function() {
            
            setupEventListeners();
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                totalInc: 0,
                totalExp: 0,
                budget: 0,
                percentage: 0
            });
        }
    }

})(budgetController, uiController)

appController.init();
