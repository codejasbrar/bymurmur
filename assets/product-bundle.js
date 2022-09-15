/**
 * Global Variables
 */
var bundleOptions = []
window.bundleOptions = bundleOptions
let variantSelectIndex = 0
let formData = {}
let bundlePriceArray = []
let bundleCamparePriceArray = []

const $cartNotification = document.querySelector('cart-notification')
const $price = document.querySelector('.bundle-price')
const $btn_price = document.querySelector('.btn_price')

const $productBundleContainers = document.querySelectorAll('.product-bundle-container')

const $bundleTitle = document.querySelector('h1.bundle-title').textContent
const $bundleDiscountValue = document.querySelector('.bundle-discount-value')?.textContent
const $originalPrice = document.querySelector('.original-price')

// const $errorMessage = document.querySelector('')

class ErrorMessage extends HTMLElement {
  constructor() {
    super()
  } 

  show() {
    this.classList.replace('hidden', 'block')
    this.scrollIntoView({ behavior: 'smooth' })
  }

  renderErrorMessage(message) {
    this.querySelector('p').textContent = message
  }
}

customElements.define('error-message', ErrorMessage)

$productBundleContainers.forEach((element) => {
  element.addEventListener('click', (event) => {
    if (
      event.target === element ||
      event.target.classList.contains('product-bundle-container-title') ||
      event.target === element.querySelector('h3')
    ) {
      $('.product-bundle-container').removeClass('open',"slow");
      $('.product-bundle-container').find('variant-selects-bundle').slideUp();
      $(element).find('variant-selects-bundle').slideDown();
      element.classList.add('open')
      console.log(element);
      // event.target.classList.toggle('open')
      // element.scrollIntoView({ behavior: 'smooth' })
    }
  })
})

/**
 * VariantSelectsBundle
 *
 * This class is extending the VariantSelects and overwriting
 * the onVariantChange() from the parent class
 */
class VariantSelectsBundle extends VariantSelects {
  constructor() {
    super()

    this.currentIndex = variantSelectIndex++
    this.variants = super.getVariantData()
    this.optionContainers = this.querySelectorAll('.options')
    this.currentSize = this.getFirstAvailableVariant().option1

    // Set default variant
    bundleOptions[this.currentIndex] = this.getFirstAvailableVariant()

    /**
     * Option Containers
     *
     * Index 0: Size
     * Index 1: Colour
     * Index 2: Null
     *
     */
    this.optionContainers.forEach((container, index, array) => {
      const buttons = container.querySelectorAll('button')

      this.disableButtons(index, array)

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const label = button.querySelector('span').textContent
          
          // If Index 0 in Option Container (Sizes), set current size
          if (index === 0) this.currentSize = label
          if (index === 1) this.currentcolor = label
          var currentSize = this.currentSize;
          var currentColor = this.currentcolor;

          /* get attr color */

          //var attr_selected_color = $(this).attr('attr_selected_color');
          
          var current_index = $(button).parents(".product-bundle-container").index();
          
          if(current_index == 2 ){
            // $(".product-bundle-container").find('button span').text(this.currentSize).trigger("click");
           // $(".product-bundle-container").find('button[title="Cloud Grey"]').trigger("click");
            
            var button_text = $(".product-bundle-container").find('button').children('span').each(function(){
              
            var cur_text = $(this).text();

              if(cur_text == currentSize){
                // $(this).parents("button").trigger("click");
              } 
              if(cur_text == currentColor){
                // $(this).parents("button").trigger("click");
              }
            });

          }
          // var button_text = $(".product-bundle-container").find('button').children('span');
          // console.log("current_index=>",current_index);
          console.log("this.currentSize=>",this.currentSize);
          console.log("this.currentcolor=>",this.currentcolor);
          
        var var_div = $(button).parents(".product-bundle-container").find(".next_btn").addClass('show');
          if(this.currentSize != undefined && this.currentSize !="" && this.currentcolor != undefined && this.currentcolor !="" ){
            var var_div = $(button).parents(".product-bundle-container").find(".next_btn").removeClass('disabled');            
          }
        $(button).parents(".product-bundle-container").find(".load_variant_0").text(this.currentSize);
        $(button).parents(".product-bundle-container").find(".load_variant_1").text(this.currentcolor);
          this.disableButtons(index, array)

          buttons.forEach((element) => {
            element.classList.remove('selected')
            // if (!element.dataset.type) return
            // const $iconQuestion = element.querySelector('.icon-question')
            // $iconQuestion.classList.remove('opacity-0')
          })

          button.classList.add('selected')
          // if (button.dataset.type) button.querySelector('.icon-question').classList.add('opacity-100')

          const $select = button.parentElement.closest('.select').querySelector('select')
          const $options = Array.from($select.options)

          const optionToSelect = $options.find((item) => {
            return item.value === label
          })
          optionToSelect.selected = true

          const changeEvent = new Event('change')
          this.dispatchEvent(changeEvent)
        })
      })
    })

    this.updateFormData()
    this.updatePrice()
  }

  /**
   * Disables Variant Buttons which are not available based on the Current Size
   *
   * @param {integer} index - The current index of the Options Container
   * @param {array} array - The Options Container Array
   */
  disableButtons(index = 0, array = []) {
    if (!array.length) return

    const relatedVariants = this.variants.filter((variant) => variant.option1 === this.currentSize)

    const unAvailableVariants = relatedVariants.filter((variant) => !variant.available)

    array[index + 1]?.querySelectorAll('button').forEach((button) => {
      button.classList.remove('disabled')
      button.disabled = false
      unAvailableVariants.forEach((item) => {
        if (button.querySelector('span').textContent === item.option2) {
          button.classList.add('disabled')
          button.disabled = true
        }
      })
    })
  }

  getFirstAvailableVariant() {
    return this.variants.find((variant) => variant.available)
  }

  onVariantChange() {
    super.updateOptions()
    super.updateMasterId()
    bundleOptions[this.currentIndex] = this.currentVariant
    this.updateFormData()
    this.updatePrice()
  }

  updatePrice() {
    // console.log('updatePrice()')
    bundleOptions.forEach((items) => {
      bundlePriceArray.push(items.price)
      bundleCamparePriceArray.push(items.compare_at_price)
    })
    const total = bundlePriceArray.reduce((previousValue, currentValue) => previousValue + currentValue, 0) / 100
    const c_total = bundleCamparePriceArray.reduce((p, c) => p + c, 0) / 100
    
    const currencySymbol = Shopify.currency.active === 'GBP' ? '£' : '€'
    // console.log("total=>",bundlePriceArray);
    // console.log("c_total=>",bundleCamparePriceArray);
    
    $price.textContent = `Now from ${currencySymbol}${parseFloat(total).toLocaleString()}`
    $btn_price.textContent = `(${currencySymbol}${parseFloat(total).toLocaleString()})`
    // $originalPrice.textContent = `Was from ${currencySymbol}${parseFloat(
    //   total / ($bundleDiscountValue / 100)
    // ).toLocaleString()}`
    $originalPrice.textContent = `Was from ${currencySymbol}${parseFloat(c_total).toLocaleString()}`
    bundlePriceArray = []
    bundleCamparePriceArray = []
  }

  updateFormData() {
    // console.warn('updateFormData()')
    formData = {
      items: bundleOptions.map(({ id }) => {
        return {
          id,
          quantity: 1,
          properties: {
            _isBundle: true,
            _bundleTitle: $bundleTitle,
          },
        }
      }),
    }
    formData.sections = $cartNotification.getSectionsToRender().map((section) => section.id)
    // formData.sections_url = window.location.pathname
  }
}

customElements.define('variant-selects-bundle', VariantSelectsBundle)

const $buyBundleButton = document.querySelector('#buy-bundle-button')

$buyBundleButton.addEventListener('click', () => {
  fetch(`${routes.cart_add_url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/javascript',
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response)
      const { status, description } = response

      const $errorMessage = document.querySelector('error-message')

      // If Error
      if (status === 422) {
        $errorMessage.renderErrorMessage(description)
        $errorMessage.show()
      }

      const obj = {
        items: response.items,
        sections: response.sections,
      }
      $cartNotification.renderContents(obj)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
})
