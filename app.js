
//Budget Controller
const budgetController = (function() {
    
    //function constructors allow you to create lots of objects
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
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
            console.log(data.allItems.inc);
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },
        testing: function() {
            console.log(data)
        }
    }


})();

//UI Controller
const uiController = (function() {

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list'
    }

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc/exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            }
        },

        addListItem: function(obj, type) {
            //create HTML string with placeholder text
            let html, newHTML, element;
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="income-%ID%">
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
                html = `<div class="item clearfix" id="expense-%ID%">
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
            newHTML = newHTML.replace('%VALUE%', obj.value);
            //insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        getDOMstrings: function() {
            return DOMstrings
        }
    }
})()

//App Controller
//delegates tasks to the other controllers
const appController = (function(budgetCtrl, uiCtrl) {

    const setupEventListeners = function() {
        const DOM = uiCtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if (event.key === "Enter") {
                ctrlAddItem();
            }
        })
    }

    

    const ctrlAddItem = function() {
        
        let input, newItem;

        //1. get field input data
        input = uiCtrl.getInput();
        
        //2. add item to budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value)
        
        //3. Add the new item to UI
        uiCtrl.addListItem(newItem, input.type);

        //4. calculate budget
        //5. display budget on UI
    }

    return {
        init: function() {
            console.log('Application started');
            setupEventListeners();
        }
    }

})(budgetController, uiController)

appController.init();