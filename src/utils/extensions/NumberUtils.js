Number.prototype.clamp = function(minValue, maxValue)
{
    let thisValue = Number(this);
    if (isNaN(thisValue))
    {
        throw "Can\'t execute clamp on a non-number entity";
    }

    if (thisValue < minValue)
    {
        return minValue;
    }
    else if (thisValue > maxValue)
    {
        return maxValue;
    }
    else
    {
        return thisValue;
    }
}