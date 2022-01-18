/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {GetGraph} from '../interaction/getGraph.js';

class LineGraph {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    drawLineGraph(lineGraphStr, bScatterplot) { let  ic = this.icn3d, me = ic.icn3dui;
        let  html, graph = JSON.parse(lineGraphStr);
        let  linkArray = [],
            nodeArray1 = [],
            nodeArray2 = [];
        let  name2node = {}
        for(let i = 0, il = graph.nodes.length; i < il; ++i) {
            let  node = graph.nodes[i];
            name2node[node.id] = node;
        }
        // only get interaction links
        let  nameHash = {}
        for(let i = 0, il = graph.links.length; i < il; ++i) {
            let  link = graph.links[i];
            if(link.v == me.htmlCls.hbondValue || link.v == me.htmlCls.ionicValue || link.v == me.htmlCls.halogenValue ||
                link.v == me.htmlCls.picationValue || link.v == me.htmlCls.pistackingValue || link.v == me.htmlCls.contactValue) {
                linkArray.push(link);
                nameHash[link.source] = 1;
                nameHash[link.target] = 1;
            }
        }
        let  nodeArrays = ic.getGraphCls.getNodeTopBottom(nameHash, name2node);
        nodeArray1 = nodeArrays.nodeArray1;
        nodeArray2 = nodeArrays.nodeArray2;
        ic.lineGraphStr = '{\n';

        let structureArray = ic.resid2specCls.atoms2structureArray(ic.hAtoms);
        //if(Object.keys(ic.structures).length > 1) {
        if(structureArray.length > 1) {

            let struc2index= {};
            let nodeArray1Split = [], nodeArray2Split = [], linkArraySplit = [], nameHashSplit = [];

            // show common interactions: nodes will be the same. The links/interactins are different.
            // The mapped residue name and number are attached to "id".
            // Original node: {id : "Q24.A.2AJF", r : "1_1_2AJF_A_24", s: "a", ...}
            // Node for common interaction: {id : "Q24.A.2AJF|Q24", r : "1_1_2AJF_A_24", s: "a", ...}
            let nodeArray1SplitCommon = [], nodeArray2SplitCommon = [], linkArraySplitCommon = [], nameHashSplitCommon = [];
            let linkedNodeCnt = {};

            for(let i = 0, il = structureArray.length; i < il; ++i) {   
                nodeArray1Split[i] = [];
                nodeArray2Split[i] = [];
                linkArraySplit[i] = [];
                nameHashSplit[i] = {};

                nodeArray1SplitCommon[i] = [];
                nodeArray2SplitCommon[i] = [];
                linkArraySplitCommon[i] = [];
                nameHashSplitCommon[i] = {};

                struc2index[structureArray[i]] = i;
            }

            for(let i = 0, il = linkArray.length; i < il; ++i) {
                let  link = linkArray[i];
                let  nodeA = name2node[link.source];
                let  nodeB = name2node[link.target];

                if(!nodeA || !nodeB || !nodeA.r || !nodeB.r) {
                    continue;
                }

                let  idArrayA = this.getIdArrayFromNode(nodeA);
                let  idArrayB = this.getIdArrayFromNode(nodeB);

                let index = struc2index[idArrayA[2]];

                if(idArrayA[2] == structureArray[index] && idArrayB[2] == structureArray[index]) {
                    linkArraySplit[index].push(link);
                    nameHashSplit[index][link.source] = 1;
                    nameHashSplit[index][link.target] = 1;

                    let chainid1 = idArrayA[2] + '_' + idArrayA[3];
                    let chainid2 = idArrayB[2] + '_' + idArrayB[3];
                    let resid1 = chainid1 + '_' + idArrayA[4];
                    let resid2 = chainid2 + '_' + idArrayB[4];

                    let mapping1, mapping2;
                    
                    if(ic.chainsMapping[chainid1] && ic.chainsMapping[chainid1][resid1]
                      && ic.chainsMapping[chainid2] && ic.chainsMapping[chainid2][resid2]) { 
                        mapping1 = (nodeA.s == "a") ? ic.chainsMapping[chainid1][resid1] : ic.chainsMapping[chainid2][resid2];
                        mapping2 = (nodeA.s == "a") ? ic.chainsMapping[chainid2][resid2] : ic.chainsMapping[chainid1][resid1];

                        let mappingid = mapping1 + '_' + mapping2 + '_' + link.c; // link.c determines the interaction type
                        if(!linkedNodeCnt.hasOwnProperty(mappingid)) {
                            linkedNodeCnt[mappingid] = 1;
                        }
                        else {
                            ++linkedNodeCnt[mappingid];
                        }
                    }
                } 
            }
            
            // set linkArraySplitCommon and nameHashSplitCommon
            for(let i = 0, il = linkArray.length; i < il; ++i) {
                let  link = linkArray[i];
                let  nodeA = name2node[link.source];
                let  nodeB = name2node[link.target];

                if(!nodeA || !nodeB || !nodeA.r || !nodeB.r) {
                    continue;
                }

                let  idArrayA = this.getIdArrayFromNode(nodeA);
                let  idArrayB = this.getIdArrayFromNode(nodeB);

                let index = struc2index[idArrayA[2]];

                if(idArrayA[2] == structureArray[index] && idArrayB[2] == structureArray[index]) {
                    let chainid1 = idArrayA[2] + '_' + idArrayA[3];
                    let chainid2 = idArrayB[2] + '_' + idArrayB[3];
                    let resid1 = chainid1 + '_' + idArrayA[4];
                    let resid2 = chainid2 + '_' + idArrayB[4];

                    let mapping1, mapping2;
                    
                    if(ic.chainsMapping[chainid1] && ic.chainsMapping[chainid1][resid1]
                      && ic.chainsMapping[chainid2] && ic.chainsMapping[chainid2][resid2]) { 
                        mapping1 = (nodeA.s == "a") ? ic.chainsMapping[chainid1][resid1] : ic.chainsMapping[chainid2][resid2];
                        mapping2 = (nodeA.s == "a") ? ic.chainsMapping[chainid2][resid2] : ic.chainsMapping[chainid1][resid1];

                        let mappingid = mapping1 + '_' + mapping2 + '_' + link.c; // link.c determines the interaction type

                        if(linkedNodeCnt[mappingid] == structureArray.length) {
                            let linkCommon = me.hashUtilsCls.cloneHash(link);
                            linkCommon.source += '>' + ic.chainsMapping[chainid1][resid1];
                            linkCommon.target += '>' + ic.chainsMapping[chainid2][resid2];

                            linkArraySplitCommon[index].push(linkCommon);
                        }  

                        nameHashSplitCommon[index][link.source] = ic.chainsMapping[chainid1][resid1];
                        nameHashSplitCommon[index][link.target] = ic.chainsMapping[chainid2][resid2];
                    }
                } 
            }

            let len1Split = [], len2Split = [], maxWidth = 0;
            let  strucArray = [];
            for(let i = 0, il = structureArray.length; i < il; ++i) {  
                let  nodeArraysTmp = ic.getGraphCls.getNodeTopBottom(nameHashSplit[i], name2node);
                nodeArray1Split[i] = nodeArraysTmp.nodeArray1;
                nodeArray2Split[i] = nodeArraysTmp.nodeArray2;

                let bCommon = true;
                nodeArraysTmp = ic.getGraphCls.getNodeTopBottom(nameHashSplit[i], name2node, undefined, bCommon, nameHashSplitCommon[i]);
                nodeArray1SplitCommon[i] = nodeArraysTmp.nodeArray1;
                nodeArray2SplitCommon[i] = nodeArraysTmp.nodeArray2;
                name2node = me.hashUtilsCls.unionHash(name2node, nodeArraysTmp.name2node);

                len1Split[i] = nodeArray1Split[i].length;
                len2Split[i] = nodeArray2Split[i].length;
                
                maxWidth = Math.max(maxWidth, len2Split[i]);

                //if(linkArraySplit[i].length > 0) strucArray.push(structureArray[i]);
                strucArray.push(structureArray[i]);
            }

            let  factor = 1;
            let  r = 3 * factor;
            let  gap = 7 * factor;
            let  height, width, heightAll;
            let  marginX = 10,
                marginY = 10,
                legendWidth = 30,
                textHeight = 20;
            
            if(bScatterplot) {
                //heightAll =(len1a + 2 + len2a + 2) *(r + gap) + 4 * marginY + 2 * legendWidth;
                //width =(Math.max(len1b, len2b) + 2) *(r + gap) + 2 * marginX + legendWidth;
                heightAll =(me.utilsCls.sumArray(len1Split) + 2*strucArray.length) *(r + gap) + 4 * marginY 
                  + 2 * legendWidth + textHeight*strucArray.length;
                // show common interaction as well
                heightAll *= 2;

                width = (maxWidth + 2) * (r + gap) + 2 * marginX + legendWidth;
                  
            } else {
                height = 110 + textHeight;
                heightAll = height * strucArray.length;
                // show common interaction as well
                heightAll *= 2;

                width = (maxWidth + 2) * (r + gap) + 2 * marginX;
            }
            let  id, graphWidth;
            if(bScatterplot) {
                ic.scatterplotWidth = 2 * width;
                graphWidth = ic.scatterplotWidth;
                id = me.scatterplotid;
            } else {
                ic.linegraphWidth = 2 * width;
                graphWidth = ic.linegraphWidth;
                id = me.linegraphid;
            }
            html =(strucArray.length == 0) ? "No interactions found for each structure<br><br>" :
                "2D integration graph for " + strucArray.length + " structure(s) <b>" + strucArray + "</b>. Common interactions are shown in the last " + strucArray.length + " graphs.<br><br>";
            html += "<svg id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";

            let  heightFinal = 0;            
            for(let i = 0, il = structureArray.length; i < il; ++i) {  
                if(bScatterplot) {
                    //heightFinal -= 15;
                    html += this.drawScatterplot_base(nodeArray1Split[i], nodeArray2Split[i], linkArraySplit[i], name2node, heightFinal, undefined, "Interactions in structure " + strucArray[i], textHeight);
                    //heightFinal = 15;
                    height =(len1Split[i] + 1) *(r + gap) + 2 * marginY + textHeight;
                } else {
                    html += this.drawLineGraph_base(nodeArray1Split[i], nodeArray2Split[i], linkArraySplit[i], name2node, heightFinal, "Interactions in structure " + strucArray[i], textHeight);
                }
                heightFinal += height;

                if(i > 0) ic.lineGraphStr += ', \n';
                ic.lineGraphStr += ic.getGraphCls.updateGraphJson(strucArray[i], i, nodeArray1Split[i], nodeArray2Split[i], linkArraySplit[i]);
            }

            // draw common interaction
            for(let i = 0, il = structureArray.length; i < il; ++i) {  
                if(bScatterplot) {
                    //heightFinal -= 15;
                    html += this.drawScatterplot_base(nodeArray1SplitCommon[i], nodeArray2SplitCommon[i], linkArraySplitCommon[i], name2node, heightFinal, undefined, "Common interactions in structure " + strucArray[i], textHeight);
                    //heightFinal = 15;
                    height =(len1Split[i] + 1) *(r + gap) + 2 * marginY + textHeight;
                } else {
                    html += this.drawLineGraph_base(nodeArray1SplitCommon[i], nodeArray2SplitCommon[i], linkArraySplitCommon[i], name2node, heightFinal, "Common interactions in structure " + strucArray[i], textHeight);
                }
                heightFinal += height;

                //if(i > 0) ic.lineGraphStr += ', \n';
                ic.lineGraphStr += ', \n';
                ic.lineGraphStr += ic.getGraphCls.updateGraphJson(strucArray[i], i + '_common', nodeArray1SplitCommon[i], nodeArray2SplitCommon[i], linkArraySplitCommon[i]);
            }

            html += "</svg>";
        } else {
            if(!bScatterplot) {
                //let  struc1 = Object.keys(ic.structures)[0];
                let  struc1 = structureArray[0];

                let  len1 = nodeArray1.length,
                    len2 = nodeArray2.length;
                let  factor = 1;
                let  r = 3 * factor;
                let  gap = 7 * factor;
                let  height = 110;
                let  margin = 10;
                let  width =(len1 > len2) ? len1 *(r + gap) + 2 * margin : len2 *(r + gap) + 2 * margin;
                ic.linegraphWidth = 2 * width;
                html =(linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
                html += "<svg id='" + me.linegraphid + "' viewBox='0,0," + width + "," + height + "' width='" + ic.linegraphWidth + "px'>";
                html += this.drawLineGraph_base(nodeArray1, nodeArray2, linkArray, name2node, 0);
                ic.lineGraphStr += ic.getGraphCls.updateGraphJson(struc1, 1, nodeArray1, nodeArray2, linkArray);
                html += "</svg>";
            } else {
                //let  struc1 = Object.keys(ic.structures)[0];
                let  struc1 = structureArray[0];

                let  len1 = nodeArray1.length,
                    len2 = nodeArray2.length;
                let  factor = 1;
                let  r = 3 * factor;
                let  gap = 7 * factor;
                let  height, width, heightAll;
                let  marginX = 10,
                    marginY = 10,
                    legendWidth = 30;
                heightAll =(len1 + 2) *(r + gap) + 2 * marginY + legendWidth;
                width =(len2 + 2) *(r + gap) + 2 * marginX + legendWidth;

                let  id, graphWidth;
                ic.scatterplotWidth = 2 * width;
                graphWidth = ic.scatterplotWidth;
                id = me.scatterplotid;
                html =(linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
                html += "<svg id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";
                html += this.drawScatterplot_base(nodeArray1, nodeArray2, linkArray, name2node, 0);
                ic.lineGraphStr += ic.getGraphCls.updateGraphJson(struc1, 1, nodeArray1, nodeArray2, linkArray);
                html += "</svg>";
            }
        }
        ic.lineGraphStr += '}\n';
        ic.scatterplotStr = ic.lineGraphStr;
        if(bScatterplot) {
            $("#" + ic.pre + "scatterplotDiv").html(html);
        } else {
            $("#" + ic.pre + "linegraphDiv").html(html);
        }
        return html;
    }

    getIdArrayFromNode(node) { let  ic = this.icn3d, me = ic.icn3dui;
        let  idArray = []; // 1_1_1KQ2_A_1
        idArray.push('');
        idArray.push('');

        let  tmpStr = node.r.substr(4); 
        idArray = idArray.concat(me.utilsCls.getIdArray(tmpStr));

        return idArray;
    }

    drawLineGraph_base(nodeArray1, nodeArray2, linkArray, name2node, height, label, textHeight) { let  ic = this.icn3d, me = ic.icn3dui;
        let  html = '';
        let  len1 = nodeArray1.length,
            len2 = nodeArray2.length;
        let  factor = 1;
        let  r = 3 * factor;
        let  gap = 7 * factor;
        let  margin = 10;
        // draw nodes
        let  margin1, margin2;
        if(len1 > len2) {
            margin1 = margin;
            margin2 = Math.abs(len1 - len2) *(r + gap) * 0.5 + margin;
        } else {
            margin2 = margin;
            margin1 = Math.abs(len1 - len2) *(r + gap) * 0.5 + margin;
        }

        // draw label
        height += textHeight;
        html += "<text x='" + margin1 + "' y='" + height + "' style='font-size:8px; font-weight:bold'>" + label + "</text>";

        let  h1 = 30 + height,
            h2 = 80 + height;
        let  nodeHtml = '';
        let  node2posSet1 = {},
            node2posSet2 = {}
        for(let i = 0; i < len1; ++i) {
            nodeHtml += ic.getGraphCls.drawResNode(nodeArray1[i], i, r, gap, margin1, h1, 'a');
            node2posSet1[nodeArray1[i].id] = { x: margin1 + i *(r + gap), y: h1 }
        }
        for(let i = 0; i < len2; ++i) {
            nodeHtml += ic.getGraphCls.drawResNode(nodeArray2[i], i, r, gap, margin2, h2, 'b');
            node2posSet2[nodeArray2[i].id] = { x: margin2 + i *(r + gap), y: h2 }
        }
        // draw lines
        for(let i = 0, il = linkArray.length; i < il; ++i) {
            let  link = linkArray[i];
            let  node1 = name2node[link.source];
            let  node2 = name2node[link.target];

            if(node1 === undefined || node2 === undefined) continue;

            let  resid1 = node1.r.substr(4);
            let  resid2 = node2.r.substr(4);
            let  pos1 = node2posSet1[node1.id];
            let  pos2 = node2posSet2[node2.id];
            if(pos1 === undefined || pos2 === undefined) continue;
            let  linestrokewidth;
            if(link.v == me.htmlCls.contactValue) {
                linestrokewidth = 1;
            } else {
                linestrokewidth = 2;
            }
            let  strokecolor;
            if(link.v == me.htmlCls.hbondValue) {
                strokecolor = "#" + me.htmlCls.hbondColor;
            } else if(link.v == me.htmlCls.ionicValue) {
                strokecolor = "#" + me.htmlCls.ionicColor;
            } else if(link.v == me.htmlCls.halogenValue) {
                strokecolor = "#" + me.htmlCls.halogenColor;
            } else if(link.v == me.htmlCls.picationValue) {
                strokecolor = "#" + me.htmlCls.picationColor;
            } else if(link.v == me.htmlCls.pistackingValue) {
                strokecolor = "#" + me.htmlCls.pistackingColor;
            } else if(link.v == me.htmlCls.contactValue) {
                strokecolor = "#" + me.htmlCls.contactColor;
            }
            html += "<g class='icn3d-interaction' resid1='" + resid1 + "' resid2='" + resid2 + "' >";
            html += "<title>Interaction of residue " + node1.id + " with residue " + node2.id + "</title>";
            html += "<line x1='" + pos1.x + "' y1='" + pos1.y + "' x2='" + pos2.x + "' y2='" + pos2.y + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";
        }
        // show nodes later
        html += nodeHtml;
        return html;
    }

    drawScatterplot_base(nodeArray1, nodeArray2, linkArray, name2node, height, bContactMap, label, textHeight) { let  ic = this.icn3d, me = ic.icn3dui;
        let  html = '';
        let  len1 = nodeArray1.length,
            len2 = nodeArray2.length;
        let  factor = 1;
        let  r = 3 * factor;
        let  gap = (bContactMap) ? r : 7 * factor;
        let  legendWidth = 30;
        let  marginX = 10,
            marginY = 20;
        let  heightTotal =(len1 + 1) *(r + gap) + legendWidth + 2 * marginY;

        // draw label
        height += textHeight;

        html += "<text x='" + marginX + "' y='" + (height + 15).toString() + "' style='font-size:8px; font-weight:bold'>" + label + "</text>";
 
        let  margin1 = height + heightTotal -(legendWidth + marginY +(r + gap)); // y-axis
        let  margin2 = legendWidth + marginX +(r + gap); // x-axis

        let  nodeHtml = '';
        let  node2posSet1 = {},
            node2posSet2 = {}
        let  x = legendWidth + marginX;
        for(let i = 0; i < len1; ++i) {
            nodeHtml += ic.getGraphCls.drawResNode(nodeArray1[i], i, r, gap, margin1, x, 'a', true);
            node2posSet1[nodeArray1[i].id] = { x: x, y: margin1 - i *(r + gap) }
        }
        let  y = height + heightTotal -(legendWidth + marginY);
        for(let i = 0; i < len2; ++i) {
            nodeHtml += ic.getGraphCls.drawResNode(nodeArray2[i], i, r, gap, margin2, y, 'b', false, bContactMap);
            node2posSet2[nodeArray2[i].id] = { x: margin2 + i *(r + gap), y: y }
        }
        // draw rect
        let  rectSize = (bContactMap) ? 2 * r : 1.5 * r;
        let  halfSize = 0.5 * rectSize;
        for(let i = 0, il = linkArray.length; i < il; ++i) {
            let  link = linkArray[i];
            let  node1 = name2node[link.source];
            let  node2 = name2node[link.target];

            if(!node1 || !node2) continue;

            html += this.drawOnePairNode(link, node1, node2, node2posSet1, node2posSet2, bContactMap);

            if(bContactMap) { // draw symmetric contact map
                html += this.drawOnePairNode(link, node2, node1, node2posSet1, node2posSet2, bContactMap);
            }
        }
        // show nodes later
        html += nodeHtml;
        return html;
    }

    drawOnePairNode(link, node1, node2, node2posSet1, node2posSet2, bContactMap) { let  ic = this.icn3d, me = ic.icn3dui;
        let html = '';

        let  factor = 1;
        let  r = 3 * factor;
        // draw rect
        let  rectSize = (bContactMap) ? 2 * r : 1.5 * r;
        let  halfSize = 0.5 * rectSize;

        let  resid1 = node1.r.substr(4);
        let  resid2 = node2.r.substr(4);
        let  pos1 = node2posSet1[node1.id];
        let  pos2 = node2posSet2[node2.id];
        if(pos1 === undefined || pos2 === undefined) return html;

        let  strokecolor;
        if(link.v == me.htmlCls.hbondValue) {
            strokecolor = "#" + me.htmlCls.hbondColor;
        } else if(link.v == me.htmlCls.ionicValue) {
            strokecolor = "#" + me.htmlCls.ionicColor;
        } else if(link.v == me.htmlCls.halogenValue) {
            strokecolor = "#" + me.htmlCls.halogenColor;
        } else if(link.v == me.htmlCls.picationValue) {
            strokecolor = "#" + me.htmlCls.picationColor;
        } else if(link.v == me.htmlCls.pistackingValue) {
            strokecolor = "#" + me.htmlCls.pistackingColor;
        } else if(link.v == me.htmlCls.contactValue) {
            strokecolor = "#" + me.htmlCls.contactColor;
        }

        let  linestrokewidth;
        if(link.v == me.htmlCls.contactValue) {
            linestrokewidth = 1;
        } else {
            linestrokewidth = 2;
        }
        html += "<g class='icn3d-interaction' resid1='" + resid1 + "' resid2='" + resid2 + "' >";
        html += "<title>Interaction of residue " + node1.id + " with residue " + node2.id + "</title>";
        if(bContactMap) {
            html += "<rect x='" +(pos2.x - halfSize).toString() + "' y='" +(pos1.y - halfSize).toString() + "' width='" + rectSize + "' height='" + rectSize + "' fill='" + strokecolor + "' stroke-width='" + linestrokewidth + "' stroke='" + strokecolor + "' />";
        }
        else {
            html += "<rect x='" +(pos2.x - halfSize).toString() + "' y='" +(pos1.y - halfSize).toString() + "' width='" + rectSize + "' height='" + rectSize + "' fill='" + strokecolor + "' fill-opacity='0.6' stroke-width='" + linestrokewidth + "' stroke='" + strokecolor + "' />";
        }
        html += "</g>";

        return html;
    }

    copyStylesInline(destinationNode, sourceNode) { let  ic = this.icn3d, me = ic.icn3dui;
        let  containerElements = ["svg", "g"];
        for(let cd = 0; cd < destinationNode.childNodes.length; cd++) {
            let  child = destinationNode.childNodes[cd];
            if(containerElements.indexOf(child.tagName) != -1) {
                this.copyStylesInline(child, sourceNode.childNodes[cd]);
                continue;
            }
            let  style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
            if(style == "undefined" || style == null) continue;
            for(let st = 0; st < style.length; st++) {
                child.style.setProperty(style[st], style.getPropertyValue(style[st]));
            }
        }
    }
}

export {LineGraph}
