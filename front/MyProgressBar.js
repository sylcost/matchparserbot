import React from 'react'
import { observer } from 'mobx-react'
import { ProgressBar } from 'react-bootstrap'
import "./css/styles.css"


export const MyProgressBar = observer((props) => 

    props.percent === 100 ? <ProgressBar bsStyle="success" striped now={100} label="100%" /> : <ProgressBar active bsStyle="warning" now={props.percent} label={`${props.percent}%`} />
)