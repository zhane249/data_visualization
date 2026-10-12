window.addEventListener("load", async()=>{
    //load JSon
    let response = await fetch("./small_data.json");
    let data = await response.json();

    //hour and number reviews
    data = data.map((value)=>({
        hour: Number(value.ds.slice(11,13)),
        reviews: Number(value.y)
    
    }));
    let hours = [];
    let averages =[];

    //average reviews/hr
    for(let hour=0; hour<24; hour++){
        let hourlyData = data.filter((value)=>value.hour == hour);

        let total=0;
        hourlyData.forEach((value)=>{
            total +=value.reviews;

        });
        hours.push(hour +":00");
        averages.push(total/hourlyData.length);
    }
    console.log(hours);
    console.log(averages);

    //canvas
    const canvas = document.getElementById("reviewChart");

    //radial bars 
    const clockBars ={
        id: "clockBars",


        afterDatasetsDraw(chart){
            const ctx = chart.ctx;
            const centerX = chart.chartArea.left + chart.chartArea.width/2;

            const centerY = chart.chartArea.top + chart.chartArea.height/2;

            const maxRadius = Math.min(
                chart.chartArea.width, chart.chartArea.height
            )/2 -15;

            const values = chart.data.datasets[0].data;
            const maxValue = Math.max(...values, 1);
            ctx.save();

            for(let i=0; i<24; i++){

                //skip 0 values
                if (values[i] ===0 || values[i] === null){
                    continue;
                }
                //hr around clock
                let angle =(i/24)* Math.PI*2 - Math.PI/2;

                //longer = more reviews
                let length = (values[i]/maxValue)*maxRadius;

                let x =centerX + Math.cos(angle)*length;
                let y = centerY + Math.sin(angle)*length;

                // ctx.beginPath();
                // ctx.moveTo(centerX, centerY);
                // ctx.lineTo(x,y);

                // ctx.strokeStyle = "#39ff14";
                // ctx.lineWidth = 10;
                // ctx.lineCap = "round";
                // ctx.stroke();

              //cones  
let width = 8;

//corners
let leftX = x + Math.cos(angle + Math.PI / 2) * width;
let leftY = y + Math.sin(angle + Math.PI / 2) * width;

let rightX = x - Math.cos(angle + Math.PI / 2) * width;
let rightY = y - Math.sin(angle + Math.PI / 2) * width;


ctx.beginPath();

// point center
ctx.moveTo(centerX, centerY);

// left edge
ctx.lineTo(leftX, leftY);

// round end
ctx.quadraticCurveTo(
    x + Math.cos(angle) * width,
    y + Math.sin(angle) * width,
    rightX,
    rightY
);

// right edge
ctx.lineTo(centerX, centerY);

ctx.closePath();

ctx.fillStyle = "#39ff14";
ctx.fill();

            }
            //hour labels
            ctx.fillStyle = "#ffffff";
            ctx.font="16px Times New Roman";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let hour = 0; hour <24; hour +=3){
                let angle =(hour/24) * Math.PI *2 - Math.PI/2;
                let radius = maxRadius + 10;
                let x = centerX + Math.cos(angle) * radius;
                let y = centerY + Math.sin(angle) * radius;

                ctx.fillText(hour + ":00", x, y);
            }
            ctx.restore();
        }
    };

let chart = new Chart(canvas, {
    type:"bar",

    data:{
        labels: hours, 
        datasets: [{
            label: "Average Reviews per Hour", 
            data: averages,
            backgroundColor: "transparent",
            borderColor: "transparent"
        }]
    },

    options:{
        responsive: true,
        maintainAspectRation: false,
        layout:{
            padding:{
                top: 30,
                bottom: 60,
                left:30,
                right:30,
            }
        },
        scales:{
            x:{
                display:false
            },
            y:{
                display: false
            },
            y: {
                display: false
            }
        },
        plugins:{
            title:{
                display: true,
                text:"Reviews by Time of Day",
                color: "#ffffff"
            },
            legend:{
                display:false

            },
            tooltip:{
                enabled: false
            }
        }
    },
    plugins: [clockBars]
})



});