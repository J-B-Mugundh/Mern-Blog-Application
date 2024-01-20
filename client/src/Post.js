export default function Post(){
    return (
        <div className="post">
          <div className="image">
          <img src="https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1185699748-e1697104507888.jpg?w=850&h=492&crop=1"/>
          </div>
          <div className="texts">
          <h2>Hackers breached Microsoft to find out what Microsoft knows about them</h2>
          <p className="info">
            <a className="author">Dawid Paszko</a>
            <time>2023-01-06 16:45</time>
          </p>
          <p>According to Microsoft, the hackers used a “password spray attack” — essentially brute forcing — against a legacy account, then used that account’s permissions “to access a very small percentage of Microsoft corporate email accounts.”</p>
          </div>
        </div>
    )
}