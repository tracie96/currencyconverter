'use strict'
function registerServiceWorker() {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('./').then(function() {
    console.log('Registration worked!');
  }).catch(function() {
    console.log('Registration failed!');
  });
};
function bootCurrency(){
  const from=document.getElementById('from');
  const to=document.getElementById('to');
  const xHttp= new XMLHttpRequest();
  xHttp.onreadystatechange=function(){
    if (this.readyState == 4 && this.status == 200){
      const obj = JSON.parse(this.responseText);
      let options='';
      for(const key in obj.results){
        options=`${options}<option>${key}</option>`;
        }
        from.innerHTML=options;
        to.innerHTML=options;
    }

  };
  xHttp.open('GET','https://free.currencyconverterapi.com/api/v5/currencies',true);
  xHttp.send();
}

function currencyConverter(){
  const from=document.getElementById('from').value;
  const to=document.getElementById('to').value;
  const amount=document.getElementById('amount').value;
  const result=document.getElementById('result');
  if(from.length>0 && to.length>0 && amount.length>0){
      const xHttp= new XMLHttpRequest();
      xHttp.onreadystatechange=function(){
        if (this.readyState == 4 && this.status == 200){
          const obj=JSON.parse(this.responseText);
          console.log(obj);
          const fact=obj[`${from}_${to}`];
          if (fact != undefined){
            result.innerHTML=parseFloat(amount)*parseFloat(fact);
          }
        }
      };
      xHttp.open('GET',`https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra`,true).then(function(response){
        document.getElementById('from').src =response.url;
      });
      xHttp.send();
  }
}



