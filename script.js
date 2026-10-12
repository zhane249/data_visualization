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
        averages.push(hourlyData.length >0? total/hourlyData.length : null);
    }
    console.log(hours);
    console.log(averages);

    //canvas
    const canvas = document.getElementById("reviewChart");
let hoveredHour = -1;
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
            const maxValue = Math.max(...values.filter(v=> Number.isFinite(v)), 1);
            ctx.save();

            for(let i=0; i<24; i++){

                //skip 0 values
                if (!Number.isFinite(values[i]) || values[i] <=0){
                    continue;
                }
                //hr around clock
                let angle =(i/24)* Math.PI*2 - Math.PI/2;

                //longer = more reviews
           let scale = i === hoveredHour ? 1.5 :1;
           let length = (values[i]/maxValue) * maxRadius * scale;


                let x =centerX + Math.cos(angle)*length;
                let y = centerY + Math.sin(angle)*length;
let width = i=== hoveredHour ? 35: 8;
                // ctx.beginPath();
                // ctx.moveTo(centerX, centerY);
                // ctx.lineTo(x,y);

                // ctx.strokeStyle = "#39ff14";
                // ctx.lineWidth = 10;
                // ctx.lineCap = "round";
                // ctx.stroke();

              //cones  

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

ctx.fillStyle = "#2458F0";
ctx.fill();

//number of reviews once hover
if (i=== hoveredHour){
    ctx.save();
//text along cone
ctx.translate(
    centerX + Math.cos(angle)*length *0.7,
    centerY + Math.sin(angle)*length*0.7
);

ctx.rotate(angle);

    ctx.fillStyle = "#FF9900";
    ctx.font = "bold 20px Times New Roman";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
ctx.fillText(
    Math.round(values[i]) + "reviews", 0, 0);
ctx.restore();
}

//ticks
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 5;

            for (let hour = 0; hour < 24; hour++) {

                // Skip main hrs
                if (hour % 3 === 0) {
                    continue;
                }

                let angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;

                let innerTick = maxRadius + 15;
                let outerTick = maxRadius + 30;

                ctx.beginPath();

                ctx.moveTo(
                    centerX + Math.cos(angle) * innerTick,
                    centerY + Math.sin(angle) * innerTick
                );

                ctx.lineTo(
                    centerX + Math.cos(angle) * outerTick,
                    centerY + Math.sin(angle) * outerTick
                );

                ctx.stroke();
            }

            }
            //hour labels
            ctx.fillStyle = "#3b2609";
            ctx.font="25px Times New Roman";
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

        },
        afterEvent(chart, args){
            if(args.event.type === "mouseout" && hoveredHour !== -1){
                hoveredHour = -1;
                chart.draw();
            }
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

  
       
options: {
    responsive: true,
    maintainAspectRatio: false,

    onHover: (event, elements, chart) => {
        const centerX = chart.chartArea.left + chart.chartArea.width / 2;
        const centerY = chart.chartArea.top + chart.chartArea.height / 2;

        const dx = event.x - centerX;
        const dy = event.y - centerY;

        // hr
        let angle = Math.atan2(dy, dx) + Math.PI / 2;

        if (angle < 0) {
            angle += Math.PI * 2;
        }

        let hour = Math.round(angle / (Math.PI * 2) * 24) % 24;

        const values = chart.data.datasets[0].data;
        const maxValue = Math.max(...values.filter(v => Number.isFinite(v)), 1);

        const maxRadius = Math.min(
            chart.chartArea.width,
            chart.chartArea.height
        ) / 2 - 15;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const length = (values[hour] / maxValue) * maxRadius;

        let newHover = -1;

        if (Number.isFinite(values[hour]) &&
            values[hour] > 0 &&
            distance > 10 &&
            distance <= length) {
            newHover = hour;
        }

        if (hoveredHour !== newHover) {
            hoveredHour = newHover;
            chart.draw();
        }
    },

        layout:{
            padding:{
                top: 20,
                bottom: 40,
                left:50,
                right:50,
            }
        },
        scales:{
            x:{
                display:false
            },
            y:{
                display: false
            },
    
        },
        plugins:{
            title:{
                display: true,
                text:"Reviews by Time of Day",
                color: "#ffffff",
                font:{
                    size: 40,
                family:"Times New Roman"},
            
            padding:{
top: 10,
bottom: 20,

            }},
            legend:{
                display:false

            },
            tooltip:{
                enabled: false
            }
        }
    },
    plugins: [clockBars]
});


//boxes interaction

    //boxes interaction

    let boxImage = document.getElementById("boxImage");
    let boxContainer = document.getElementById("boxContainer");
    let graphContainer = document.getElementById("graphContainer");

    let boxOpen = false;
    let animating = false;

    boxContainer.addEventListener("click", function() {

        //no click while playing
        if (animating) {
            return;
        }

        animating = true;

        if (boxOpen == false) {

            //open

            boxImage.src = "./boxes/box2.png";

            setTimeout(function() {
                boxImage.src = "./boxes/box3.png";
            }, 500);

            // Shrink box after opening
            setTimeout(function() {
                boxContainer.classList.add("small");
            }, 1000);

            // Show graph after box shrinks
            setTimeout(function() {
                graphContainer.style.display = "block";

                chart.resize();
                chart.draw();

                boxOpen = true;
                animating = false;
            }, 2000);

        } else {

            // close

            // Hide graph immediately
            graphContainer.style.display = "none";

            // Enlarge 
            boxContainer.classList.remove("small");

            // closing 
            setTimeout(function() {
                boxImage.src = "./boxes/box2.png";
            }, 1000);

            setTimeout(function() {
                boxImage.src = "./boxes/box1.png";

                boxOpen = false;
                animating = false;
            }, 1500);
        }
    });

}); 
