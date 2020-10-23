
let db;

const request = indexedDB.open("budgetTracker", 1);

request.onupgradeneeded= function(event){
    const db = event.target.result;

    db.createObjectStore("pending", { autoIncrement:true });

};

request.onsuccess = function(event){
    db = event.target.result;

    if(navigator.onLine){
        checkDatabase();
    }
};

request.onerror = function (event){
    console.log("Hey human, an error occured! Go fix!", event.target.errorCode);
}

function saveRecord(record){
    const trans = db.transaction(["pending"], "readwrite");

    const store = trans.objectStore("pending");

    store.add(record);
};

function checkDatabase(){
    const trans = db.transaction(["pending"], "readwrite");
    const store = trans.objectStore("pending");
    const getAll = store.getAll();

    

    getAll.onsuccess = ()=>{
        const {result} = getAll
        
        if (getAll.result.length>0){

            const reqBody = JSON.stringify(result)
            let myHeaders= new Headers();
            myHeaders.append("Content-Type", "application/json");
            
            fetch("/api/transaction/bulk", {
                method:"POST", 
                body: reqBody,
                headers: myHeaders,             
            }).then(response=> response.json()).then(()=>{
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending")
                store.clear()
                location.reload();
            }).catch(err =>console.log(err))
        }
    }
}