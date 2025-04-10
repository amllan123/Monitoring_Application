const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
     {
                userId: { type: String, required: true},

                productId: { type: String, required: true },
                productTitle: { type: String, required: true },

                quantity: { type: Number, required: true,default: 1 }, 

                productImage: { type: String, required: true },
                productPrice: { type: Number, required: true },
                productColor: { type: String },
                productSize: { type: String  },
               adress: { type: Object, required: true},
               status: { type: String, required: true, default: 'pending' },


     },{timestamps: true}
   
 );

 module.exports =mongoose.model('Order', CartSchema);  