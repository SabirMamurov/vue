let eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
   <div class="product">
	    <div class="product-image">
            <img :src="image" :alt="altText" />
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
            <a :href="link">More products like this</a>
            <p v-if="inStock">In Stock</p>
            <p v-else :class="{ disabledStock: !inStock }">Out of Stock</p> 
            <p v-else>Out of stock</p>
            <span v-if="sale">On Sale</span>
            <span v-else>Not On Sale</span>
            <p>{{ sale }}</p>
            <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor:variant.variantColor }"
                    @mouseover="updateProduct(index)"
            ></div>
            <ul v-for="size in sizes">
                <li>{{ size }}</li>
            </ul>
            <div class="row">
                <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to cart</button>
                <button v-on:click="deleteFromCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Reduce to cart</button>
            </div>
   </div>
   <product-tabs :reviews="reviews" :shipping="shipping" :details="details"></product-tabs>
   </div>

   
 `,
    data() {
        return {
            product: "Socks",
            description: "A pair of warm, fuzzy socks",
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            inventory: 100,
            onSale: true,
            brand: 'Vue Mastery',
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    onSale: true,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0,
                    onSale: false,
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            cart: 0,
            selectedVariant: 0,
            reviews: [],
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart',
                this.variants[this.selectedVariant].variantId);
        },
        deleteFromCart() {
            this.$emit('delete-from-cart',
                this.variants[this.selectedVariant].variantId);
        },
        updateCart(id) {
            this.cart.push(id);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        sale() {
            return this.variants[this.selectedVariant].onSale
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }

    },
})

Vue.component('product-review', {
    template:  `
        <form class="review-form" @submit.prevent="onSubmit">
         <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
            <li v-for="error in errors">{{ error }}</li>
        </ul>
        </p>
        <p>
          <label for="name">Name:</label>
          <input id="name" v-model="name">
        </p>
        
        <p>
          <label for="review">Review:</label>      
          <textarea id="review" v-model="review"></textarea>
        </p>
        
        <p>
          <label for="rating">Rating:</label>
          <select id="rating" v-model.number="rating">
            <option>5</option>
            <option>4</option>
            <option>3</option>
            <option>2</option>
            <option>1</option>
          </select>
        </p>
        <p>Would you recommend this product?</p>
        <label>
          Yes
          <input type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label>
          No
          <input type="radio" value="No" v-model="recommend"/>
        </label> 
        <p>
          <input type="submit" value="Submit">  
        </p>    
    </form>
    
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: [],
            recommend: null,
        }
    },
    methods: {
        onSubmit() {
            this.errors = []
            if (this.name && this.review && this.rating && this.recommend ) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Recommendation required.")
            }
        }
    }
})
Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        shipping: {
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
      <div>
        <ul>
          <span class="tab" :class="{ activeTab: selectedTab === tab }" v-for="(tab, index) in tabs" @click="selectedTab = tab"
          >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
               <li v-for="review in reviews">
                    <p>{{ review.name }}</p>
                    <p>Rating: {{ review.rating }}</p>
                    <p>{{ review.review }}</p>
                    <textarea v-model="review.comment" placeholder="Напишите комментарий..."></textarea>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>

        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
            <product-details :details="details"></product-details>
        </div>
    
      </div>
    
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review','Shipping', 'Details'],
            selectedTab: 'Reviews',
            reverse: false,
            search: "",
        }
    },
})

Vue.component('detail-tabs', {
    props: {
        shipping: {
            required: true
        },
        reviews: {
            type: Array,
            required: false
        },
    },
    template: `
      <div> 
        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
            <product-details :details="details"></product-details>
        </div>
      </div>
    `,
    data() {
        return {
            tabs: ['Shipping', 'Details'],
        }
    }
})



let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        deleteCart() {
            this.cart.pop();
        },
    }
})