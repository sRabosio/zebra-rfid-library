const toSortedArray = <T>(array:T[], sortingFunc?: (a:T, b:T)=>number)=>{
    return structuredClone(array).sort(sortingFunc)
}
export default toSortedArray