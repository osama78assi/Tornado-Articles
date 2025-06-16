async function sendRequest() {
    try {
        const req = await fetch("http://127.0.0.1:3000/api/v1/auth/signin", {
            headers: {
                "Content-Type": "application/json",
            },
            body: {
                email: "osama78assi@gmail.com",
                password: "osAmA123#",
            },
            method: "POST",
            credentials: "include",
        });
        const res = await req.json();

        console.log(res);
    } catch (err) {
        console.log(err.message);
    }
}

document.getElementById("send").addEventListener("click", sendRequest);
