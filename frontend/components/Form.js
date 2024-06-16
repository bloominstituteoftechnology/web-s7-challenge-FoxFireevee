import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as yup from 'yup';

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// Starting empty templates for the form, form errors, and keeping track of the submits disabled state

const initalForm = () => ({
  fullName: '',
  size: '',
  toppings: []
})

const initalErrors = () => ({
  fullName: '',
  size: '',
  toppings: []
})

const initalDisabled = false

// 👇 Here you will create your schema.

const userSchema = yup.object().shape({
  fullName: yup.string().required().trim()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong),
  size: yup.string()
    .required()
    .oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect),
  // toppings: yup.array()
  //   .of(yup.string().oneOf(['1', '2', '3', '4', '5']))
})

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppingsArray = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {
   // States
   const [formValues, setFormValues] = useState(initalForm);
   const [formErrors, setFormErrors] = useState(initalErrors);
   const [disabled, setDisabled] = useState(initalDisabled);
   const [serverSuccess, setServerSuccess] = useState('');
   const [serverFailure, setServerFailure] = useState('');

   // useEffect, whenever the state changes, it validates against the schema and updates the submitting state accordingly
   useEffect(() => {
    userSchema.isValid(formValues).then(valid => { setDisabled(valid) })
   }, [formValues])

   // On Change handler tracking the updated state from the users input
   const onChange = evt => {
    let { type, name, value, checked } = evt.target;
    if (type === 'checkbox') {
      const toppingID = name;
      const updatedToppings = checked ? [...formValues.toppings, toppingID] : formValues.toppings.filter(id => id !== toppingID)
      setFormValues({...formValues, toppings: updatedToppings});
      // yup.reach(userSchema, `toppings[${index}]`).validate(checked)
      //   .then(() => setFormErrors({ ...formErrors, [`toppings[${index}]`]: '' }))
      //   .catch(err => setFormErrors({ ...formErrors, [`toppings[${index}]`]: err.errors[0] }))
      
    } else {
      setFormValues({ ...formValues, [name]: value});
      yup.reach(userSchema, name).validate(value)
        .then(() => setFormErrors({...formErrors, [name]: ''}))
        .catch((err) => setFormErrors({...formErrors, [name]: err.errors[0]}))
    }
    
   }

   const onSubmit = evt => {
    evt.preventDefault();
    const payload = {
      fullName: formValues.fullName,
      size: formValues.size,
      toppings: formValues.toppings
    }

    console.log('Payload: ', payload)
    axios.post('http://localhost:9009/api/order', payload)
      .then(res => {
        setServerSuccess(res.data.message);
        setServerFailure('');
        setFormValues(initalForm);
        console.log(res.data.message)
      })
      .catch(err => {
        setServerFailure(err.response.data.message);
        setServerSuccess('');
        console.log(err.response.data.message)
      })
   }


  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {serverSuccess && <div className='success'>{serverSuccess}</div>}
      {serverFailure && <div className='failure'>{serverFailure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input 
            value={formValues.fullName}
            placeholder="Type full name" 
            id="fullName" 
            name='fullName'
            type="text" 
            onChange={onChange}
          />
          {formErrors.fullName && <div className='validation'>{formErrors.fullName}</div>}
        </div>
        {/* {true && <div className='error'>Bad value</div>} */}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select 
            id="size"
            value={formValues.size}
            name='size'
            onChange={onChange}
          >
            <option value="">----Choose Size----</option>
            <option value='S'>Small</option>
            <option value='M'>Medium</option>
            <option value='L'>Large</option>
            {/* Fill out the missing options */}
          </select>
          {formErrors.size && <div className='validation'>{formErrors.size}</div>}
        </div>
        {/* {true && <div className='error'>Bad value</div>} */}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppingsArray.map((topping) => {
          return (
            <label key={topping.topping_id}>
              <input
                id={topping.text}
                type='checkbox'
                name={topping.topping_id}
                onChange={onChange}
                checked={formValues.toppings.includes(topping.topping_id)}
              />
              {topping.text}
            </label>
          )
        })}
        {/* <label key="1">
          <input
            name="Pepperoni"
            type="checkbox"
          />
          Pepperoni<br />
        </label> */}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={!disabled}/>
    </form>

    
  )
}
