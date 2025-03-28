import {data} from "./PortfolioData.js";
import {closeApp, minimizeApp} from "../../index.js";
export default {
    data() {
        return {
            data: data,
            showDays: false,
            showLocation: false,
            showSettings: false,
            currentDay: 0,
            forecast: [],
            months: {
                0: "Jan",
                1: "Feb",
                2: "Mar",
                3: "Apr",
                4: "May",
                5: "Jun",
                6: "Jul",
                7: "Aug",
                8: "Sep",
                9: "Oct",
                10: "Nov",
                11: "Dec"
            },
            longitude: 0,
            latitude: 0,
        }
    },
    template: `
      <div id="weather">
        <button @click="showSettings = !showSettings" class="weather-setting-toggle weather-setting-button">
          <img class="weather-setting-icon" :src="plusMinus" alt="">
        </button>
        <div class="weather-settings" v-if="showSettings">

          <div class="weather-div">
            <div class="weather-settings-popup" v-if="showDays">
              <button class="big-button" v-for="day in 7" @click="currentDay = day - 1">{{ getDate(day - 1) }}</button>
            </div>
            <button class="weather-setting-button" @click="toggleShowDays">
              <img class="weather-setting-icon" src="../../Images/day.png" alt="">
            </button>
          </div>
          <div class="weather-div">
            <div class="weather-settings-popup" v-if="showLocation" @click.stop>
              Longitude: <input class="weather-input" v-model="longitude"/>
              Latitude: <input class="weather-input" v-model="latitude"/>
              <button class="big-button" @click="updateWeather">Set</button>
              <button class="big-button" @click="getLocation">Get Location</button>
            </div>
            <button class="weather-setting-button" @click="toggleShowLocation">
              <img class="weather-setting-icon" src="../../Images/longitude-latitude.png" alt="">
            </button>
          </div>
          <button class="weather-setting-button" @click="minimizeApp(app)">
            <img class="weather-setting-icon" src="../../Images/minimize.png" alt="">
          </button>
          <button class="weather-setting-button" @click="closeApp(app)">
            <img class="weather-setting-icon" src="../../Images/close.png" alt="">
          </button>
          <button class="weather-setting-button draggable" v-draggable @mousedown="hidePopups">
            <img class="weather-setting-icon draggable" src="../../Images/drag.png" alt="" v-draggable>
          </button>
        </div>
        <div id="weather-pond" style="">
          <img :src="currentWeather" alt="">
        </div>
        <!--{{getWeather(forecast[currentDay])}};-->
      </div>
    `,
    mounted() {
        this.app.top = "52%"
        this.app.left = "66%"
        this.app.hideBorder = true
        this.updateWeather()
        setInterval(() => {
            this.updateWeather()
        }, 1000*60*10)
    },
    computed: {
        plusMinus() {
            return `../../Images/${this.showSettings ? 'minus' : 'plus'}.png`
        },
        currentWeather() {
            return `../../Images/Weather/${this.getWeather(this.forecast[this.currentDay])}.png`
        }
    },
    methods: {
        getLocation() {
            navigator.geolocation.getCurrentPosition((position) => {
                this.latitude = position.coords.latitude
                this.longitude = position.coords.longitude
                this.updateWeather()
            })
        },
        minimizeApp,
        closeApp,
        toggleShowDays() {
            this.showDays = !this.showDays
            this.showLocation = false
        },
        toggleShowLocation() {
            this.showLocation = !this.showLocation
            this.showDays = false
        },
        hidePopups() {
            this.showLocation = false
            this.showDays = false
        },
        getDate(n) {
            let date = new Date()
            let newDate = new Date()
            newDate.setDate(date.getDate() + n)
            let printableDate = newDate.getDate()
            if (printableDate < 10) printableDate = "0" + printableDate
            printableDate = this.months[newDate.getMonth()] + " " + printableDate
            return printableDate
        },
        getWeather(code) {
            if (code <= 1) return "Clear"
            if (code <= 3) return "Cloudy"
            if (code <= 48) return "Foggy"
            if (code <= 67) return "Rainy"
            if (code <= 77) return "Snowy"
            if (code <= 82) return "Rainy"
            if (code <= 86) return "Snowy"
            if (code <= 99) return "Thunder"
            return "Clear"
        },
        updateWeather() {
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${this.latitude}&longitude=${this.longitude}&current=weather_code&daily=weather_code&timezone=America%2FNew_York`)
                .then((response) => {
                    if (!response.ok) {
                        return
                    }
                    response.json().then((result) => {
                        this.forecast = result.daily.weather_code
                        this.forecast[0] = result.current.weather_code // not sure if needed
                    })
                })
        }
    },
    props: {
        app: Object,
    },
}