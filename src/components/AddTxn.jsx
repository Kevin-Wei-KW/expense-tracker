import React, {useState} from "react";

import "./AddTxn.css";
import TxnBox from "./containers/TxnBox";



export default function AddTxn(props) {
    const currentDate = new Date();
    const [date, setDate] = useState(currentDate.toISOString().split("T")[0]);
    const [type, setType] = useState("Food");
    const [detail, setDetail] = useState();
    const [amount, setAmount] = useState();

    const typeOptions = [
        { value: 'food', label: 'Food' },
        { value: 'rec', label: 'Rec' },
        { value: 'school', label: 'School' },
        { value: 'misc', label: 'Misc' },
        { value: 'grocery', label: 'Grocery' },
        { value: 'earning', label: 'Earning' },
    ]
      

    async function addTxn() {
        event.preventDefault();
        props.setPage();

        const data = {
            "date": date,
            "txn": type,
            "desc": detail? detail: "",
            "dr": amount && type === 'Earning'? Number(amount):0,
            "cr": amount && type !== 'Earning'? Number(amount):0,
        }

        await props.pushTxns(data)

        // 'use server'
        // const productId = formData.get('productId')
        // await updateCart(productId)
    }

    return(
        <div>
            <form onSubmit={addTxn} className="AddTxn">
                <input className="line-input" type="date" name="dateId" value={date} onChange={(e) => setDate(e.target.value)}/>
                {/* <input class="line-input" placeholder="Type:" type="text" name="typeId" value={type} onChange={(e) => setType(e.target.value)}/> */}

                <select className="line-input" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Food">Food</option>
                    <option value="Rec">Rec</option>
                    <option value="School">School</option>
                    <option value="Misc">Misc</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Earning">Earning</option>
                </select>
                
                <textarea className="box-input" placeholder="Details:" type="text" name="detailId" value={detail} onChange={(e) => setDetail(e.target.value)}/>
                {/* <DropdownList data={typeOptions} dataKey="id" textField="name" defaultValue={0}/> */}
                {/* <Select class="line-input" options={typeOptions} /> */}
                <input className="line-input" placeholder="Amount:" type="number" max="100000" name="amountId" value={amount} onChange={(e) => setAmount(e.target.value)}/>

                <TxnBox className="preview" type={type} date={date} details={detail} value={type=='Earning'? amount:-amount}></TxnBox>

                <div className="confirm-cancel">
                    <button className="cancel" type="button" onClick={props.setPage}>Cancel</button>
                    <button className="confirm" type="submit">Confirm</button>
                </div>
            </form>
        </div>
    )
}