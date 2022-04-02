Array.prototype.permutate = function(sampleSize, uniqueOnly)
{
    let allPermutations = [];
    let uniqueCombinations = new Set();
  
    const permute = (arr, m = []) =>
    {
        if (m.length === sampleSize)
        {
            let mKey = m.sort((a, b) => {return a.name > b.name ? -1 : 1}).reduce((sum, curr) => sum += curr.name, "");
            if (uniqueOnly)
            {
                if (!uniqueCombinations.has(mKey))
                {
                    uniqueCombinations.add(mKey);
                    allPermutations.push(m);
                }

                return;
            }

            allPermutations.push(m);
            return;
        }
        
        for (let i = 0; i < arr.length; i++)
        {
            let curr = arr.slice();
            let next = curr.splice(i, 1);

            permute(curr.slice(), m.concat(next));
        }
    }
  
    permute(this);
    return allPermutations;
}