/* @refresh reload */
import { render } from "solid-js/web"
import "solid-devtools"

import { App } from "./App"
import "./index.css"

render(() => <App />, document.getElementById("root") as HTMLElement)
