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
            )/2 -35;

            const values = chart.data.datasets[0].data;
            const maxValue = Math.max(...values, 1);
            ctx.save();

            for(let i=0; i<24; i++){
                //hr around clock
                let angle =(i/24)* Math.PI*2 - Math.PI/2;

                //longer = more reviews
                let length = (values[i]/maxValue)* maxRadius;

                let x =centerX + Math.cos(angle)*length;
                let y = centerY + Math.sin(angle)*length;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x,y);

                ctx.strokeStyle = "#39ff14";
                ctx.lineWidth = 7;
                ctx.lineCap = "round";
                ctx.stroke();

            }
            //hour labels
            ctx.fillStyle = "#ffffff";
            ctx.font="12px Times New Roman";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let hour = 0; hour <24; hour +=3){
                let angle =(hour/24) * Math.PI *2 - Math.PI/2;
                let radius = maxRadius + 20;
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