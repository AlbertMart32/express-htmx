const formHtmx = (book) => /*html*/ `
<form hx-put="/books/${book.id}/edit" >
  <fieldset class="fieldset">
    <input 
    type="text" class="input" autofocus 
    placeholder="Author" name="author" value="${book.author}"/> 
  
    <input 
    type="text" class="input"  
    placeholder="Title" name="title" value="${book.title}"/> 
    <button type="submit" class="btn">Edit Book</button>
  </fieldset>
  
</form>

`;

export default formHtmx;
