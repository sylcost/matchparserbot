import React from 'react'
import { observer } from 'mobx-react'
import { Image, Row, Col } from 'react-bootstrap'
import "./css/styles.css"


export const WaitingIcon = observer((props) => {

    
    let waitingIcon = 
    (<Row className="show-grid" >
        <Col>
            <div align="center">
                <Image src="25.svg" />
            </div>
        </Col>
    </Row>)


    return (
        props.active ? waitingIcon : null
    );

})