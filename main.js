// Import Etherscan API key
import { etherScanApiKey } from './config.js';


document.addEventListener('DOMContentLoaded', function() {
    const storedStatEthBalance = sessionStorage.getItem('statEthBalance');
    const storedStatethValue = sessionStorage.getItem('statethValue');
    const storedStatwalletUSD = sessionStorage.getItem('statwalletUSD');

    const statEthBalance = document.querySelector('#ethBalance')
    const statethValue = document.querySelector('#ethValue')
    const statwalletUSD = document.querySelector('#walletUSD')
    const statethAccountTable = document.querySelector('#ethAccountTable')

    if (storedStatEthBalance && statEthBalance) {
        document.querySelector('#ethBalance').innerHTML = storedStatEthBalance;
    }
    if (storedStatethValue && statethValue) {
        document.querySelector('#ethValue').innerHTML = storedStatethValue;
    }
    if (storedStatwalletUSD && statwalletUSD) {
        document.querySelector('#walletUSD').innerHTML = storedStatwalletUSD;
    }


    const savedTable = sessionStorage.getItem('savedTable');
    if (savedTable && statethAccountTable) {
        document.getElementById('ethAccountTable').innerHTML = savedTable;
    }

    
    // Check if the element exists before adding the event listener
    const walletConnectButton = document.querySelector('.wallet-connect');
    if (walletConnectButton) {
        walletConnectButton.addEventListener('click', connectMetaMaskWallet);
    }

    const checkEthAddressButton = document.querySelector('.check-eth-address');
    if (checkEthAddressButton) {
        checkEthAddressButton.addEventListener('click', getEthAccountInfo);
    }


    setInterval(connectMetaMaskWallet, 5 * 60 * 1000);

  
});



async function getEthAccountInfo() {

    const searchEthBalance = document.querySelector('#ethSearchBalance')
    const searchEthValue = document.querySelector('#ethSearchValue')
    const searchWalletUSD = document.querySelector('#walletSearchUSD')
    const searchWalletLink = document.querySelector('#ethSearchAccount')
    

    const ethereumAddressInput = document.querySelector('.eth-address')
    const ethereumAddress = ethereumAddressInput.value;
    const accBalance = await getEtherscanAccountBalance(ethereumAddress);
    console.log(`Balance for ${ethereumAddress}:`, accBalance, 'ETH');

    const transactions = await getEtherscanAccountTransactions(ethereumAddress);
    console.log(`Last 10 transactions for ${ethereumAddress}:`, transactions);
    displayTransactions(transactions, '#ethSearchTable');

    const ethData = await getCoinPriceUSD("ethereum")
    let currentEthPrice = ethData.market_data.current_price.usd;
    let currentEthBalUsd = accBalance * currentEthPrice;



    searchEthBalance.innerHTML = `Ethereum Balance:<br> ${accBalance} ETH`;
    sessionStorage.setItem('searchEthBalance', searchEthBalance.innerHTML);

    searchEthValue.innerHTML = `Current Price of ETH<br>$${currentEthPrice.toLocaleString()}`;
    sessionStorage.setItem('searchEthValue', searchEthValue.innerHTML);

    searchWalletUSD.innerHTML = `Wallet Balance in USD:<br> $${currentEthBalUsd.toLocaleString()}`;
    sessionStorage.setItem('searchWalletUSD', searchWalletUSD.innerHTML);


    let url = `https://etherscan.io/address/${ethereumAddress}`;
    searchWalletLink.setAttribute('href', url)
    searchWalletLink.textContent = `${ethereumAddress}`;
    
}










async function displayTransactions(transactions, divID) {
    
    let mainOrTestNetTxHash;


    // Create a table
    const table = document.createElement('table');
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ["Timestamp", "To", "Value", "Look Up"].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    transactions.forEach(transaction => {
        const row = document.createElement('tr');

        // Convert timestamp to date string
        const date = new Date(transaction.timeStamp * 1000).toLocaleString();

        const valueInWei = BigInt(transaction.value);
        const valueInEther = Number(valueInWei) / 1e18;
        //console.log(valueInEther)
        //console.log(divID)
        const mainNetTxHash = transaction.hash;
        const testNetTxHash = transaction.hash;

        if ( divID === "#ethSearchTable") {
            
            mainOrTestNetTxHash = `https://etherscan.io/tx/${mainNetTxHash}`
        } else {
            
            mainOrTestNetTxHash = `https://sepolia.etherscan.io/tx/${testNetTxHash}`
        }
        
        // Create an anchor element for "TX Look Up"
        const anchor = document.createElement('a');
        anchor.href = mainOrTestNetTxHash;
        anchor.textContent = 'TX Look Up';
        anchor.target = '_blank';

        const values = [date, transaction.to, valueInEther, anchor];
        values.forEach(value => {
            const td = document.createElement('td');
            if (value instanceof HTMLAnchorElement) {
                // Append the anchor element if the value is an anchor
                td.appendChild(value);  
            } else {
                // Otherwise, set the text content as usual
                td.textContent = value; 
            }
            
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    // Insert the table into the lower-content div
    const lowerContentSearchDiv = document.querySelector(divID);
    // Clear the content of the div
    if(lowerContentSearchDiv) {
        lowerContentSearchDiv.innerHTML = '';
        lowerContentSearchDiv.appendChild(table);
     } else {
        console.error('Element with selector', divID, 'not found!');
     }

    const ethAccountTableDiv = document.getElementById('ethAccountTable');
    sessionStorage.setItem('savedTable', ethAccountTableDiv.innerHTML);

}











async function connectMetaMaskWallet() {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            // You can use `accounts[0]` to get the connected account if needed
            console.log('Connected with account:', accounts[0]);

            // Fetch balance
            const balance = await getMetaMaskBalance(accounts[0]);
            //console.log(`Balance of ${accounts[0]}: ${balance} ETH`);


            

            const statEthBalance = document.querySelector('#ethBalance')
            const statethValue = document.querySelector('#ethValue')
            const statwalletUSD = document.querySelector('#walletUSD')

            const ethData = await getCoinPriceUSD("ethereum")
            let currentEthPrice = ethData.market_data.current_price.usd;
            let currentEthBalUsd = balance * currentEthPrice;




            // Set the innerHTML and save to sessionStorage
            statEthBalance.innerHTML = `Ethereum Balance:\n ${balance} ETH`;
            sessionStorage.setItem('statEthBalance', statEthBalance.innerHTML);
            
            statethValue.innerHTML = `Current Price of ETH<br>$${currentEthPrice.toLocaleString()}`;
            sessionStorage.setItem('statethValue', statethValue.innerHTML);
            
            statwalletUSD.innerHTML = `Wallet Balance in USD:<br> $${currentEthBalUsd.toLocaleString()}`;
            sessionStorage.setItem('statwalletUSD', statwalletUSD.innerHTML);

            const transactions = await getEtherscanAccountTestnetTransactions(accounts[0]);
            displayTransactions(transactions, '#ethAccountTable');
            

            const gasPrice = await getSafeGasEstimate();
            console.log(gasPrice);


        } catch (error) {
            console.error('User denied account access');
        }
    } else {
        console.error('MetaMask is not installed.');
    }
}




async function getMetaMaskBalance(account) {
    try {
        const balanceWei = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [account, 'latest']
        });

        // Divide the balance by 10^18 to get the whole number
        const wholeEther = BigInt(balanceWei) / BigInt("1000000000000000000");

        // Use modulus operation to get the remainder
        const remainderWei = BigInt(balanceWei) % BigInt("1000000000000000000");

        // Convert remainder to a string and pad with leading zeros for correct representation
        // get up to 18 decimals
        const remainderStr = remainderWei.toString().padStart(18, '0').substr(0, 18);  

        // Combine whole number and remainder
        const balanceEther = wholeEther.toString() + "." + remainderStr;

        // This gives you a string representation of the balance in Ether
        return balanceEther; 

    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}






function getCoinPriceUSD(coinName) {

    const url = `https://api.coingecko.com/api/v3/coins/${coinName}?sparkline=true`;

    return $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        headers: {
            'Accept': 'application/json'
        }
    })
    .done(data => {
        return data;
    })
    .fail((jqXHR, textStatus, error) => {
        console.log('There was a problem with the fetch operation for', coinName, ':', error);
    });
    
}




async function getEtherscanAccountBalance(address) {
    const endpoint = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherScanApiKey}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    // This will return the converted wei to ETH
    return parseInt(data.result) / 10**18;  
}

async function getEtherscanAccountTransactions(address) {
    const endpoint = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${etherScanApiKey}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    // This will return the last 10 transactions for the given address
    return data.result;  
}


async function getEtherscanAccountTestnetTransactions(address) {
    const endpoint = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${etherScanApiKey}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    // This will return the last 10 testnet transactions for the given address
    return data.result;  
}

async function getSafeGasEstimate() {
    const endpoint = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${etherScanApiKey}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    // This will return the safe gas price
    return data.result;  
}
