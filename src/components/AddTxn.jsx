import React, {useState} from "react";

import "./AddTxn.css";
import TxnBox from "./containers/TxnBox";



export default function AddTxn(props) {
    const currentDate = new Date();
    const [date, setDate] = useState(currentDate.toISOString().split("T")[0]);
    const [type, setType] = useState("Food");
    const [detail, setDetail] = useState();
    const [amount, setAmount] = useState();

    const [isCr, setIsCr] = useState(true);

    const typeOptions = [
        { value: 'food', label: 'Food' },
        { value: 'recreation', label: 'Recreation' },
        { value: 'school', label: 'School' },
        { value: 'misc', label: 'Misc' },
        { value: 'grocery', label: 'Grocery' },
        { value: 'housing', label: 'Housing' },
        { value: 'earning', label: 'Earning' },
    ]
      

    async function addTxn() {
        event.preventDefault();
        props.setPage();

        const data = {
            "date": date,
            "txn": type,
            "desc": detail? detail: "",
            "dr": amount && !isCr? Number(amount):0,
            "cr": amount && isCr? Number(amount):0,
        }

        await props.pushTxns(data)

        // 'use server'
        // const productId = formData.get('productId')
        // await updateCart(productId)
    }

    function updateType(txnType) {
        setType(txnType);

        if(txnType == "Earning") {
            setIsCr(false);
        } else {
            setIsCr(true);
        }
    }

    return(
        <div>
            <form onSubmit={addTxn} className="AddTxn">
                <input className="line-input" type="date" name="dateId" value={date} onChange={(e) => setDate(e.target.value)}/>
                {/* <input class="line-input" placeholder="Type:" type="text" name="typeId" value={type} onChange={(e) => setType(e.target.value)}/> */}

                <select className="line-input" value={type} onChange={(e) => updateType(e.target.value)}>
                    <option value="Food">Food</option>
                    <option value="Recreation">Recreation</option>
                    <option value="School">School</option>
                    <option value="Misc">Misc</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Housing">Housing</option>
                    <option value="Earning">Earning</option>
                </select>
                
                <textarea className="box-input" placeholder="Details:" type="text" name="detailId" value={detail} onChange={(e) => setDetail(e.target.value)}/>
                {/* <DropdownList data={typeOptions} dataKey="id" textField="name" defaultValue={0}/> */}
                {/* <Select class="line-input" options={typeOptions} /> */}
                <input className="line-input" placeholder="Amount:" type="number"inputMode="decimal" min="0" max="100000" name="amountId" step="any" value={amount} onChange={(e) => setAmount(e.target.value)}/>

                <TxnBox
                    className="preview"
                    type={type}
                    date={date}
                    details={detail}
                    value={isCr? -amount:amount}
                    clickFunc={() => setIsCr(!isCr)}></TxnBox>

                <div className="confirm-cancel">
                    <button className="cancel" type="button" onClick={props.setPage}>Cancel</button>
                    <button className="confirm" type="submit">Confirm</button>
                </div>
            </form>
        </div>
    )
}