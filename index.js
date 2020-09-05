

const input = document.querySelector("#value");
const bt1 = document.querySelector("#bt1");
const wrapper = document.querySelector(".content");
const balance = document.querySelector(".current-balance")
const categories = document.querySelector(".categories")
const x = document.querySelector(".x");
var db = firebase.firestore();




let startValue = 0;
let expenses = {
    food: 0,
    party:0,
    clothes:0,
    balance:0
}
balance.innerHTML = `<p class="p-balance">Expenses</p><p class="p-number">${expenses.balance}$<p/>`;
//adding expense
bt1.addEventListener("click",() =>{
    const val = parseInt(input.value,10);
    if(isNaN(document.querySelector(".inp").valueAsNumber)==true){
        UIkit.notification({message: 'enter correct expense value!'})
    }
    else{
        
        expenses.balance = expenses.balance+val;
        balance.innerHTML = `<p class="p-balance">Expenses</p><p class="p-number">${expenses.balance}$<p/>`;
        create(val);
        writeData();
    }
    
    
})
//updating data to firestore
function writeData(){
    firebase.database().ref("expenses").set({
        food:expenses.food,
        clothes:expenses.clothes,
        party:expenses.party
    })
  }
//creating new transaction data
function create(inputval){
    const food = document.querySelector("#food")
    const party = document.querySelector("#party")
    const clothes = document.querySelector("#clothes")
    let cat = 0;
    
        if(food.checked == true){
            cat = "food"
            expenses.food = expenses.food +inputval;
           function updateFood(){
            myChart.data.datasets[0].data[0] = expenses.food;
            myChart.update();
           }
           updateFood();
    
        } else if (party.checked==true){
            cat="party"
            expenses.party = expenses.party +inputval;
            myChart.data.datasets[0].data[2] = expenses.party;
            function updateParty(){
                myChart.data.datasets[0].data[2] = expenses.party;
                myChart.update();
               }
               updateParty();
        }else if(clothes.checked==true){
            cat="clothes"
            expenses.clothes = expenses.clothes +inputval;
            myChart.data.datasets[0].data[1] = expenses.clothes;
            function updateClothes(){
                myChart.data.datasets[0].data[1] = expenses.clothes;
                myChart.update();
               }
               updateClothes();
        }else{
            cat="unknown"
        }
        const x = document.createElement("li");
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        x.innerHTML= `transaction value = ${inputval}<br> date: ${today}<br> category: ${cat}  `;
        x.classList.add("transaction");
        document.querySelector(".transactions").appendChild(x);
        db.collection("users").doc(`${document.querySelector(".user-nav").textContent}`).set(expenses).then(()=>{
            console.log("update dziala")
        })
        db.collection("users").doc(`${document.querySelector(".user-nav").textContent}`).collection("transactions").add({
            value:inputval,
            category:cat,
            date:today
        })
    
   
    
}
/*chart*/
let ctx = document.getElementById('myChart')
let myChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['food', 'clothes', 'party'],
        datasets: [{
            label: '# of Votes',
            data: [expenses.food, expenses.clothes, expenses.party],
            backgroundColor: [
                '#FFC46B',
                '#32AD9D',
                '#AD639E'
            ]
         
        }]
    }

});



/*firebase*/
function addUser(){
    let emailR = document.querySelector("#account-register").value;
    let passwordR= document.querySelector("#password-register").value;
    firebase.auth().createUserWithEmailAndPassword(emailR, passwordR).then(()=>{
        UIkit.notification({message: 'registered succesfully!'})
    }).catch(function(error) {
        document.querySelector(".error").textContent = error.message;
      });
      //make collection
      db.collection("users").doc(emailR).set({
        name: emailR,
        food: 0,
        clothes: 0,
        party:0,
        balance:0
    })
  
    
      
}
function logInUser(){
    let emailE = document.querySelector("#account").value;
    let passwordE= document.querySelector("#password").value;
    firebase.auth().signInWithEmailAndPassword(emailE, passwordE).then(()=>{
        toggle()
         
        wrapper.classList.remove("hidden");
    }).catch(function(error) {
        
            document.querySelector(".error").textContent = error.message;
        
      })
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          document.querySelector(".logout").classList.remove("logoutHidden")
          document.querySelector(".user-nav").textContent = user.email;
          db.collection("users").doc(user.email).get().then(function(doc){
            if(doc.exists){
                expenses.food=doc.data().food;
                expenses.clothes=doc.data().clothes;
                expenses.party=doc.data().party;
                expenses.balance=doc.data().balance;

                myChart.data.datasets[0].data[0] = expenses.food;
               
                
                myChart.data.datasets[0].data[1] = expenses.clothes;
                
              
                myChart.data.datasets[0].data[2] = expenses.party;
                myChart.update();
           
            
                balance.innerHTML = `<p class="p-balance">Expenses</p><p class="p-number">${doc.data().balance}$<p/>`;
                document.querySelector(".nav-links").classList.add("hidden")
            }
        })
        db.collection("users").doc(`${document.querySelector(".user-nav").textContent}`).collection("transactions").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                renderTransaction(doc.data().value,doc.data().date,doc.data().category)
                console.log(doc.id, " => ", doc.data());
            });
        });
        
        } else {
          // User is signed out.
          // ...
        }
      });

     
      
      
}
//rendering transactions
function renderTransaction(value,date,category){
    const transaction = document.createElement("li")
    transaction.innerHTML= `transaction value = ${value}<br> date: ${date}<br> category: ${category} `;
    transaction.classList.add("transaction");
    document.querySelector(".transactions").appendChild(transaction);

}
    
//logout
function resetData(){
    expenses.food=0;
    expenses.balance=0;
    expenses.clothes=0;
    expenses.party=0;
    myChart.data.datasets[0].data[0] = expenses.food;
    myChart.data.datasets[0].data[1] = expenses.clothes;
    myChart.data.datasets[0].data[2] = expenses.party;
    myChart.update();
    balance.innerHTML = `<p>expenses</p><p>${expenses.balance}$<p/>`;
    setTimeout(function(){ location.reload(); }, 1000);
    
   


}
const logoutBtn = document.querySelector(".logout")
logoutBtn.addEventListener("click",()=>{
    firebase.auth().signOut().then(function() {
        document.querySelector(".nav-links").classList.remove("hidden")
        UIkit.notification({message: 'logged out succesfully'})
        document.querySelector(".user-nav").textContent = "";
        logoutBtn.classList.add("logoutHidden")
        resetData()
        const trans  = document.querySelector(".transactions");
        for(child in trans){
            trans.removeChild(trans.childNodes[0])
        }
      
        
        
   
      }).catch(function(error) {
        // An error happened.
      });
})

/*login btn*/
let iflogin = false;
let ifregister = false;
const loginBtn = document.querySelector(".login");
const registerBtn = document.querySelector(".register");
const hide = document.querySelector(".x");
const hide2 = document.querySelector(".x2");


loginBtn.addEventListener("click",function(){
    document.querySelector(".login-wrapper").classList.remove("hidden");
    wrapper.classList.add("hidden");
    iflogin = true;
    if(ifregister){
        toggle2();
        ifregister=false;
    }

})
registerBtn.addEventListener("click",function(){
    document.querySelector(".register-wrapper").classList.remove("hidden");
    wrapper.classList.add("hidden");
    ifregister = true;
    if(iflogin){
        toggle();
        iflogin= false;
    }

})
hide.addEventListener("click",()=>{
    document.querySelector(".login-wrapper").classList.add("hidden");
    wrapper.classList.remove("hidden");
    iflogin= false;
})




hide2.addEventListener("click",()=>{
    document.querySelector(".register-wrapper").classList.add("hidden");
    wrapper.classList.remove("hidden");
    ifregister = false;


})
function toggle(){
    document.querySelector(".login-wrapper").classList.add("hidden");
    
}
function toggle2(){
    document.querySelector(".register-wrapper").classList.add("hidden");
    
}
//reveal transaction list
const arrow = document.querySelector(".arrow-down")
let isOpen = false;
arrow.addEventListener("click",()=>{
    
    if(isOpen==false){
        document.querySelector(".transactions").classList.remove("hidden")
        isOpen=true;

    }else{
        document.querySelector(".transactions").classList.add("hidden")
        isOpen=false;
    }
})




