import {jsonExchangeCustomerAgent} from "./api";
import {allJsonExchanges} from "../common/api";

const getItems = async () => {
    const response = await jsonExchangeCustomerAgent.exchange(allJsonExchanges.item.readAll, undefined);
    console.log(response);
};

document.getElementById('item').addEventListener('click', ()=>getItems());
// document.getElementById('subitem').addEventListener('click', ()=>getItems());