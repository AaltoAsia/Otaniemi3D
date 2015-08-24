<html>
<head>
<script>
function getElements() {
    var x = document.getElementsByName("x");
    document.getElementById("demo").innerHTML = x.length;
}
</script>
</head>
<body>

<p>
Cats: <input name="x" type="radio" value="Cats">
Dogs: <input name="y" type="radio" value="Dogs">
</p>

<p>
<input type="button" onclick="getElements()" value="How many elements named x?">
</p>

<p id="demo"></p>

</body>
</html>